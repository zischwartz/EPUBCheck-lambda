// https://stackoverflow.com/a/20643568
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");

const JAR_PATH = "/opt/nodejs/epubcheck-4.1.1/epubcheck.jar";

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
  // console.log("stdout:", stdout);
  // console.log("stderr:", stderr);
};

// "java -jar /opt/nodejs/epubcheck-4.1.1/epubcheck.jar"
// `java -jar ${JAR_PATH} /var/task/book.epub`
// `java -jar ${JAR_PATH} --version`

// https://github.com/IDPF/epub3-samples/releases/download/20170606/accessible_epub_3.epub

// const http = require('http');
// const fs = require('fs');
//
// const file = fs.createWriteStream("file.jpg");
// const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
//   response.pipe(file);
// });
