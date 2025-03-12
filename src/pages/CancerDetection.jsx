import { useState } from "react";
import axios from "axios";

function CancerDetection() {
  return <DetectionTool title="Cancer Detection" apiUrl="https://detect.roboflow.com/cancer-detection-rgfq8/2" />;
}

function DetectionTool({ title, apiUrl }) {
  const [image, setImage] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [message, setMessage] = useState("");
  const [originalSize, setOriginalSize] = useState({ width: 1, height: 1 });
  const displayWidth = 320; // Fixed display width for the image

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setImage(imgURL);
      setMessage(""); // Clear previous result

      const img = new Image();
      img.src = imgURL;
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height });
        uploadImage(file);
      };
    }
  };

  const uploadImage = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result.split(",")[1];
      try {
        const response = await axios.post(apiUrl, base64, {
          params: { api_key: "kHoIkIocUUOowEA18OER" },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const predictions = response.data.predictions || [];
        setBoxes(predictions);

        if (predictions.length > 0) {
          const highestConfidenceBox = predictions.reduce((prev, curr) =>
            prev.confidence > curr.confidence ? prev : curr
          );
          setMessage(
            `The image shows ${Math.round(highestConfidenceBox.confidence * 100)}% probability of having cancer from ${highestConfidenceBox.class}. class of cancer`
          );
        } else {
          setMessage("No cancer detected.");
        }
      } catch (error) {
        setMessage("Error: " + error.message);
      }
    };
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-red-600 mb-6">{title}</h2>

      <label className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition">
        Upload Image
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>

      {image && (
        <div className="relative mt-6 border rounded-lg shadow-lg p-2 bg-white w-[320px]">
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-auto rounded-lg"
          />
          {boxes.map((box, index) => {
            const scaleFactor = displayWidth / originalSize.width; // Scale factor based on resized image width

            return (
              <div key={index}>
                {/* Label Positioned Above the Box */}
                <div
                  className="absolute text-xs font-semibold px-2 py-1 bg-yellow-500 text-black rounded-md"
                  style={{
                    left: `${(box.x - box.width / 2) * scaleFactor - 30}px`,
                    top: `${(box.y - box.height / 2) * scaleFactor - 72}px`, // Moves text above the box
                  }}
                >
                  {box.class} ({Math.round(box.confidence * 100)}%)
                </div>

                {/* Bounding Box */}
                <div
                  className="absolute border-2 border-yellow-500"
                  style={{
                    left: `${(box.x - box.width / 2) * scaleFactor -10 }px`,
                    top: `${(box.y - box.height / 2) * scaleFactor - 20}px`,
                    width: `${box.width * scaleFactor}px`,
                    height: `${box.height * scaleFactor}px`,
                    backgroundColor: "rgba(255, 255, 0, 0.3)",
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show the result text only AFTER receiving a response */}
      {message && (
        <div className="mt-6 p-4 bg-white shadow-md rounded-lg w-3/4 text-center">
          <h3 className="font-semibold text-gray-700">{message}</h3>
        </div>
      )}
    </div>
  );
}

export default CancerDetection;
