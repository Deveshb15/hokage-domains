const main = async() => {
    const [owner, randomPerson] = await hre.ethers.getSigners()
    const domainContractFactory = await hre.ethers.getContractFactory('Domains')
    const domainContract = await domainContractFactory.deploy("hok")
    await domainContract.deployed()

    console.log('Contract address, ', domainContract.address)
    console.log('Contract deployed by, ', owner.address)

    let txn = await domainContract.registerDomain("devesh", {value : hre.ethers.utils.parseEther('0.1')})
    await txn.wait()

    console.log('Domain owner: ', await domainContract.getAddress("devesh"))

    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
    
    // txn = await domainContract.setCharacter("danga", "Naruto")
    // await txn.wait()
    // console.log("Character: ", await domainContract.getCharacter("danga"))

    // txn = await domainContract.setCharacterLink("danga", "https://www.otakukan.com/wp-content/uploads/2019/07/naruto-1.jpg.webp?ezimgfmt=ng%3Awebp%2Fngcb15%2Frs%3Adevice%2Frscb15-2")
    // await txn.wait()
    // console.log("Character Link: ", await domainContract.getCharacterLink("danga"))

} 

const runMain = async() => {
    try {
        await main()
        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

runMain()