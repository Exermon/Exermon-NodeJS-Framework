import {getProvider} from "../modules/dou/constants";

async function test() {
  const provider = getProvider("devnet")
  const blockNumber = await provider.getBlockNumber()

  console.log(provider, blockNumber)
}
test().then()
