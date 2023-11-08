const fs = require("fs");
const fileModel = require("../models/Files");
const csvParser = require("csv-parser");

var isUpdated = false;

const mergeChunks = async (fileName, totalChunks) => {
    const chunkDir = __dirname + "/chunks";
    const mergedFilePath = __dirname + "/merged_files";
  
    if (!fs.existsSync(mergedFilePath)) {
      fs.mkdirSync(mergedFilePath);
    }
  
    const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
    for (let i = 0; i < totalChunks; i++) {
      const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
      const chunkBuffer = await fs.promises.readFile(chunkFilePath);
      writeStream.write(chunkBuffer);
      fs.unlinkSync(chunkFilePath);
    }
  
    writeStream.end();
    console.log("Chunks merged successfully");
  };

const convertToJSON = (path, username) => {
    let products = [];
    fs.createReadStream(path)
        .pipe(csvParser())
        .on('data', (data) => {
            data['username'] = username;
            products.push(data);
        })
        .on('end', function() {
            console.log("Data loaded");
            addToDB(products);
        })
}
const addToDB = (products) => {
    fileModel.insertMany(products).then(function () {
        console.log("Successfully saved default items to DB");
        isUpdated = true;
      }).catch(function (err) {
        console.log(err);
      });
}

const getView = async (req, res) => {
    try {
        const username = req.query.username;
        const page = parseInt(req.query.page);
        const pageSize = 30;
        const count = await fileModel.countDocuments({ username: username});
        const paginatedProducts = await fileModel.find({ username: username}).skip(pageSize*(page-1)).limit(pageSize);
        const totalPages = Math.ceil(count / pageSize) > 0 ? Math.ceil(count / pageSize) : 1;
        res.json({ products: paginatedProducts, totalPages, isUpdated });
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: "Error retrieving data" });
    }
}
  
const uploadFile = async (req, res) => {
    console.log("Hit");
    isUpdated = false;
    const chunk = req.file.buffer;
    const chunkNumber = Number(req.body.chunkNumber);
    const totalChunks = Number(req.body.totalChunks);
    const fileName = req.body.originalname;
    const username = req.body.username;
    console.log(fileName, chunkNumber);
    if(chunkNumber === 0) {
        const validHeaders = ["product_name", "price", "sku", "description\r"];
        const text = chunk.toString();
        const headers = text.slice(0, text.indexOf("\n")).split(",");
        if(JSON.stringify(headers) !== JSON.stringify(validHeaders)) {
            return res.status(400).json({ error: "not product csv" });
        }
    }
    const chunkDir = __dirname + "/chunks";

    if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir);
    }

    const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

    try {
        await fs.promises.writeFile(chunkFilePath, chunk);
        console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

        if (chunkNumber === totalChunks - 1) {
            await mergeChunks(fileName, totalChunks);
            console.log("File merged successfully");
            convertToJSON(__dirname + "/merged_files/" + fileName, username);
        }
        res.status(200).json({ message: "Chunk uploaded successfully" });
    } catch (error) {
        console.error("Error saving chunk:", error);
        res.status(500).json({ error: "Error saving chunk" });
    }
}

module.exports = {uploadFile, getView};