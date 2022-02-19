const main = async () => {
	const domainContractFactory = await hre.ethers.getContractFactory("Domains");
	const domainContract = await domainContractFactory.deploy("hokage");
	await domainContract.deployed();

	console.log("Contract deployed to:", domainContract.address);

	let txn = await domainContract.register("devesh", {
		value: hre.ethers.utils.parseEther("1"),
	});
	await txn.wait();
	console.log("Minted domain devesh.hokage");

	txn = await domainContract.setCharacter("devesh", "Kakashi");
	await txn.wait();
	console.log("Set character for devesh.hokage");

	txn = await domainContract.setCharacterLink("devesh", "https://static.wikia.nocookie.net/naruto/images/2/27/Kakashi_Hatake.png/revision/latest?cb=20170628120149");
	await txn.wait()
	console.log("Set character link for devesh.hokage");

	const balance = await hre.ethers.provider.getBalance(domainContract.address);
	console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
};

const runMain = async () => {
	try {
		await main();
		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

runMain();
