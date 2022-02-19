// const main = async () => {
// 	const [owner, randomPerson] = await hre.ethers.getSigners();
// 	const domainContractFactory = await hre.ethers.getContractFactory("Domains");
// 	const domainContract = await domainContractFactory.deploy("hokage");
// 	await domainContract.deployed();

// 	console.log("Contract address, ", domainContract.address);
// 	console.log("Contract deployed by, ", owner.address);

// 	let tx = await domainContract.register("devesh", {
// 		value: hre.ethers.utils.parseEther("1"),
// 	});
// 	await tx.wait();

// 	// txn = await domainContract.setCharacter("devesh", "Naruto")
// 	// await txn.wait()
// 	// console.log("Character: ", await domainContract.getCharacter("devesh"))

// 	// txn = await domainContract.setCharacterLink("devesh", "https://www.otakukan.com/wp-content/uploads/2019/07/naruto-1.jpg.webp?ezimgfmt=ng%3Awebp%2Fngcb15%2Frs%3Adevice%2Frscb15-2")
// 	// await txn.wait()
// 	// console.log("Character Link: ", await domainContract.getCharacterLink("danga"))

// 	const balance = await hre.ethers.provider.getBalance(domainContract.address);
// 	console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

//     txn = await domainContract.connect(randomPerson).register("devesh", {
//         value: hre.ethers.utils.parseEther("1"),
//     });
//     await txn.wait();
// 	// try {
// 	// } catch (error) {
// 	// 	console.log("Could not rob contract");
// 	// }

// 	// Let's look in their wallet so we can compare later
// 	// let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
// 	// console.log(
// 	// 	"Balance of owner before withdrawal:",
// 	// 	hre.ethers.utils.formatEther(ownerBalance)
// 	// );

//     // // Oops, looks like the owner is saving their money!
//     // txn = await domainContract.connect(owner).withdraw();
//     // await txn.wait();
    
//     // // Fetch balance of contract & owner
//     // const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
//     // ownerBalance = await hre.ethers.provider.getBalance(owner.address);

//     // console.log("Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));
//     // console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
// };

// const runMain = async () => {
// 	try {
// 		await main();
// 		process.exit(0);
// 	} catch (error) {
// 		console.error(error);
// 		process.exit(1);
// 	}
// };

// runMain();


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
