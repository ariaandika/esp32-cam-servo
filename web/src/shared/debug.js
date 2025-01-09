
import fs from "fs"
import * as H from "@vladmandic/human"

const human = new H.Human({ modelBasePath: "file://"+process.cwd()+"/public"  });
await human.load();
await human.warmup();
const buffer = fs.readFileSync("./.tmp/app.png");
const tensor = human.tf.node.decodeImage(buffer);
const result = await human.detect(tensor);

console.log(result)
