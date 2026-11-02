import ImageKit from '@imagekit/nodejs';

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("IMAGEKIT_PRIVATE_KEY environment variable is required");
}

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadFile(buffer){
    const response = await client.files.upload({
        file: buffer.toString("base64"),
        fileName: 'image'+Date.now()+".jpg",
        folder: "products"
      });
      return response
}
export default uploadFile