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

	txn = await domainContract.setRecord("devesh", "I feel bad for sarada as she want's be a Hokage too:)))");
	await txn.wait();
	console.log("Set record for devesh.hokage");

	const address = await domainContract.getAddress("devesh");
	console.log("Owner of domain devesh:", address);

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
