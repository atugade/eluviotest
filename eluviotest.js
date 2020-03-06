const { ElvClient } = require ("elv-client-js/src/ElvClient");
var urljoin = require ("url-join");
var fs = require('fs');

const configUrl = "https://demov3.net955210.contentfabric.io/config";
const libraryId = "ilib2XMVpCuHpSz6AdhZVLusb56T58XU";
const videoType = "hq__3PZfyrGKF3x8ajKRH7zzLR2qHLcPf5jc4Dk7aLzQWBFKL2zoSGZcjHx7MirucYj2NckBDCWSoc";

var addContent = async function asyncCall() {
  const client = await ElvClient.FromConfigurationUrl({
    configUrl: configUrl
  });
  
  console.log(client);
  
  const wallet = client.GenerateWallet();
  
  console.log(wallet);
  
  const signer = wallet.AddAccount({
    privateKey: process.argv[2]
  });
  
  console.log(signer);
  
  client.SetSigner({signer});

  try {
    const createResponse = await client.CreateContentObject({
      "libraryId": libraryId,
      "options": {
        "type": videoType,
        "meta": {
          "name" : process.argv[3],
          "toMerge": {
            "merge": "me"
          },
          "toReplace": {
            "replace": "me"
          },
          "toDelete": {
            "delete": "me"
          }
        }
      }
    });

    const objectId = createResponse.id;
    const writeToken = createResponse.write_token;
    
    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadata: {
        tags: [
          "video",
          "audio"
        ]
      }
    });
  
    const uploadfile = await client.UploadPart({
      "libraryId": libraryId,
      "objectId": objectId,
      "writeToken": writeToken,
      "data": fs.readFileSync(process.argv[3])
    });
  
    await client.MergeMetadata({
      "libraryId": libraryId,
      "objectId": objectId,
      "writeToken": writeToken,
      "metadata":{"video":uploadfile.part.hash},
    });
  
    await client.FinalizeContentObject({
      "libraryId": libraryId,
      "objectId": objectId,
      "writeToken": writeToken
    });
  } catch(error){ console.log(error)};
}

addContent();
