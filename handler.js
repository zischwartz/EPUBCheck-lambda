// https://stackoverflow.com/a/20643568
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");

const JAR_PATH = "/opt/nodejs/epubcheck-4.2.0/epubcheck.jar";

module.exports.handler = async function(event, context) {
  // console.log(event);
  let req_body = JSON.parse(event["body"]);
  let { epub_uri } = req_body;
  // console.log(epub_uri);
  let origin = event["headers"]["origin"] || event["headers"]["Origin"] || "*";
  let result = "";
  // the -L makes it follow redirects, which is important
  let { stdout, stderr } = await exec(`curl -L ${epub_uri} > /tmp/book.epub`);
  // const { stdout, stderr } = await exec("java");

  try {
    let { stdout, stderr } = await exec(
      `java -jar ${JAR_PATH} /tmp/book.epub --json /tmp/result.json `
    );
  } catch (e) {
    // -f cuts down on these but they'll still happen with fatal ones
    // console.log("it exited with 1, which just means there was an error",e)
  }

  try {
    result = fs.readFileSync("/tmp/result.json", { encoding: "utf8" });
  } catch (e) {
    result = "'error'";
  }
  try {
    fs.unlinkSync("/tmp/result.json");
    fs.unlinkSync("/tmp/book.epub");
  } catch (e) {
    //
  }
  const response = {
    statusCode: 200,
    body: result,
    // body: JSON.stringify({ status: "cool!" }),
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": true
      // "Access-Control-Allow-Origin": "*"
    }
  };

  return response;
};
