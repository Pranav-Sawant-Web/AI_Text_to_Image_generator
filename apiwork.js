// api url and token
const URL = "https://api.monsterapi.ai/v1/generate/txt2img";
const TOKEN = "PLace your copied key here";

// importing functions to transfer images
import { UpdateImageBox } from "./script.js";

// Function to check the status of the process
const checkStatus = async (process_id) => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${TOKEN}`,
    },
  };

  try {
    const response = await fetch(
      `https://api.monsterapi.ai/v1/status/${process_id}`,
      options
    );
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error checking status:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

// Function to handle the result based on the process status
export const sendProcessIdAndFetchResult = async (process_id) => {
  try {
    let statusResponse = await checkStatus(process_id);

    while (
      statusResponse.status === "LAUNCHING" ||
      statusResponse.status === "IN_PROGRESS"
    ) {
      console.log(
        `Status is ${statusResponse.status}. Checking again in 5 seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
      statusResponse = await checkStatus(process_id);
    }

    if (statusResponse.status === "COMPLETED") {
      console.log("Process completed. Response =", statusResponse);
      const ImageArray = statusResponse.result.output;
      console.log("ImageArray =", ImageArray);
      UpdateImageBox(ImageArray);
    } else if (statusResponse.status === "FAILED") {
      console.error("Process failed:", statusResponse);

      const errorMessage =
    statusResponse.result?.message || statusResponse.result?.error || "Unknown error";

  alert("Image generation failed: " + errorMessage);
      // Handle the failure (e.g., notify the user, log the error, etc.)
    } else {
      console.error("Unexpected status:", statusResponse.status);
    }
  } catch (error) {
    console.error("Error in sendProcessIdAndFetchResult:", error);
  }
};

// Function to generate AI images
export const generateAiImages = async (prompt, numberOfImages, imageStyle) => {

console.log("Prompt:", prompt);
  console.log("Style:", imageStyle);
  console.log("Samples:", numberOfImages);

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      safe_filter: true,
      prompt: prompt || "A realistic sunset over mountains",
      style: imageStyle || "realistic",
      samples: Number(numberOfImages) || 1,
    }),
  };

  try {
    const response = await fetch(URL, options);
    const responseData = await response.json();
    console.log("Response data =", responseData);
    console.log("Response process ID =", responseData.process_id);
    await sendProcessIdAndFetchResult(responseData.process_id);
    return responseData;
  } catch (error) {
    console.error("Error generating AI images:", error);
  }
};
