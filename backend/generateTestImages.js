// const fs = require("fs")
// const path = require("path")

// const generateTestImage = async (recipeName, imageFileName) => {
//   const imageDir = path.join(__dirname, "public", "recipe-images")

//   // Create directory if it doesn't exist
//   if (!fs.existsSync(imageDir)) {
//     fs.mkdirSync(imageDir, { recursive: true })
//   }

//   // Create a placeholder image file by copying the default image
//   const sourceImage = path.join(__dirname, "sample-recipe-image.jpg")
//   const targetImage = path.join(imageDir, imageFileName)

//   try {
//     if (fs.existsSync(sourceImage)) {
//       fs.copyFileSync(sourceImage, targetImage)
//       return true
//     } else {
//       console.log("Source image not found:", sourceImage)
//       return false
//     }
//   } catch (error) {
//     console.error("Error generating test image:", error)
//     return false
//   }
// }

// module.exports = { generateTestImage }
