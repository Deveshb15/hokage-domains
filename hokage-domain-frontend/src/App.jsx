import React, { useState, useEffect } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';
import contractAbi from './utils/DomainsABI.json'
import { ethers } from 'ethers'

// Constants
const TWITTER_LINK = `https://twitter.com`;
const tld = '.hokage';
const CONTRACT_ADDRESS = '0xC6A83480C81808617eCFcF135AB55e8521F39d70'

const App = () => {

  const [currentAccount, setCurrentAccount] = useState('')
  const [domain, setDomain] = useState('')
  const [character, setCharacter] = useState('')
  const [characterLink, setCharacterLink] = useState('')
  const [network, setNetwork] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [mints, setMints] = useState([])

  const connectWallet = async() => {
    try {
      const { ethereum } = window

      if(!ethereum) {
        alert("Get metamask -> https://metamask.io/download")
        return;
      }

      const accounts = await ethereum.request({method: 'eth_requestAccounts'})

      console.log("Connected ", accounts[0])
      setCurrentAccount(accounts[0])
    } catch(error) {
      console.log(error)
    }
  }

  const switchNetwork = async() => {
    if(window.ethereum) {
      try {
        await window.ethereum.request({
  				method: 'wallet_switchEthereumChain',
  				params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
  			});
      } catch(error) {
          if(error.code === 4902) {
            try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x13881',
      								chainName: 'Polygon Mumbai Testnet',
      								rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
      								nativeCurrency: {
      										name: "Mumbai Matic",
      										symbol: "MATIC",
      										decimals: 18
      								},
                      blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                    }
                  ]
                })
            } catch(err) {
              console.log(err)
            }
          }
      }
    }
  }

  const checkIfWalletIsConnected = async() => {
    const {ethereum} = window

    if(!ethereum) {
      console.log("Make sure you have metamask")
      return;
    } else {
      console.log('found eth obj, ', ethereum)
    }

    const accounts = await ethereum.request({method: 'eth_accounts'})

    if(accounts.length > 0) {
      const account = accounts[0]
      console.log('Found authorized account: ', account)
      setCurrentAccount(account)
    } else {
      console.log('No account found')
    }

    const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

    ethereum.on('chainChanged', handleChainChanged);
		
		// Reload the page when they change networks
		function handleChainChanged(_chainId) {
			window.location.reload();
		}
  }

  const fetchMints = async() => {
    try {
      const { ethereum } = window;
  		if (ethereum) {
  			// You know all this
  			const provider = new ethers.providers.Web3Provider(ethereum);
  			const signer = provider.getSigner();
  			const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
  				
  			// Get all the domain names from our contract
  			const names = await contract.getAllNames();

        const mintCharacters = await Promise.all(names.map(async(name) => {
          const mintCharacter = await contract.characters(name)
          const mintCharacterLink = await contract.links(name)
          const owner = await contract.domains(name)
          return {
            id: name.indexOf(name),
            name: name,
            character: mintCharacter,
            characterLink: mintCharacterLink,
            owner: owner,
          }
        }))

        console.log("mints fetched", mintCharacters)
        setMints(mintCharacters)
      }
    } catch(error) {
      console.log(error)
    }
  }

  useEffect(() => {
	if (network === 'Polygon Mumbai Testnet') {
		fetchMints();
	}
}, [currentAccount, network]);

  const mintDomain = async() => {
    if(!domain) { return }

    if(domain.length < 3) {
      alert('Domain must be atleast 3 characters long')
      return;
    }

    const price = domain.length===3 ? '0.5' : domain.length===4 ? '0.3' : '0.1';

    console.log('Minting domain', domain, 'with price', price)

    try {
        const {ethereum} = window
  
        if(ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner()
          const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer)
          // console.log(contract)

          console.log("Going to pop wallet now to pay gas...")

          let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
          // Wait for the transaction to be mined
    			const receipt = await tx.wait();
          // console.log(receipt)
          // console.log(domain, character, characterLink)
    
    			// Check if the transaction was successfully completed
    			if (receipt.status === 1) {
    				console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
    				
    				// Set the character for the domain
    				tx = await contract.setCharacter(domain, character);
            await tx.wait();
    				console.log("Character set! https://mumbai.polygonscan.com/tx/"+ await tx.hash);

            // set character link for domain
            tx = await contract.setCharacterLink(domain, characterLink);
            await tx.wait();
    				console.log("Character link set! https://mumbai.polygonscan.com/tx/"+ await tx.hash);

            setTimeout(() => {
    					fetchMints();
    				}, 2000);
    				
    				setCharacter('');
            setCharacterLink('');
    				setDomain('');
    			}
    			else {
    				alert("Transaction failed! Please try again");
    			}
          
        } 
      
    } catch(err) {
      console.log(err)
    }
  }

  const updateDomain = async() => {
    if(!character || !characterLink || !domain) { return }
    setLoading(true)
    console.log("Updating domain", domain, " with character", character, " with character link", characterLink)

    try {
      const { ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
  			const signer = provider.getSigner();
  			const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        let tx = await contract.setCharacter(domain, character);
        await tx.wait()

        console.log("Record set https://mumbai.polygonscan.com/tx/"+tx.hash);

        fetchMints();
        setCharacter('');
        setCharacterLink('');
        setDomain('');
      } 
    } catch(error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
  }

  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img src="https://media1.giphy.com/media/2y98KScHKeaQM/giphy.gif" alt="Naruto gif" />
      <button onClick={connectWallet} className="cta-button connect-wallet-button">Connect Wallet</button>
    </div>
  )

  const renderInputForm = () =>{

    if(network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <p style={{marginBottom: '16px'}}>Please connect to the Polygon Mumbai Testnet</p>
          <button className='cta-button connect-wallet-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      )
    }
    
		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>
				<input
					type="text"
					value={character}
					placeholder="Who's your favourite character?"
					onChange={e => setCharacter(e.target.value)}
				/>
				<input
					type="text"
					value={characterLink}
					placeholder='Add character image link!'
					onChange={e => setCharacterLink(e.target.value)}
				/>

        {
          editing ? (
              <div className="button-container">
                  <button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
  								Set Character
  							</button>  
  							<button className='cta-button mint-button' onClick={() => {setEditing(false)}}>
  								Cancel
  							</button>  
              </div>
          ) : (
            <div className="button-container">
    					<button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
    						Mint
    					</button>    
    				</div>
          )
        }

			</div>
		);
	}

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const renderMints = () => {
	if (currentAccount && mints.length > 0) {
		return (
			<div className="mint-container">
				<p className="subtitle"> Recently minted domains!</p>
				<div className="mint-list">
					{ mints.map((mint, index) => {
						return (
							<div className="mint-item" key={index}>
								<div className='mint-row'>
									<a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
										<p className="underlined">{' '}{mint.name}{tld}{' '}</p>
									</a>
									{/* If mint.owner is currentAccount, add an "edit" button*/}
									{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
										<button className="edit-button" onClick={() => editRecord(mint.name)}>
											<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
										</button>
										:
										null
									}
								</div>
					<p> {mint.character} </p>
          <img style={{width: '250px', height: 'auto'}} src={mint.characterLink} alt={mint.name} />
				</div>)
				})}
			</div>
		</div>);
	}
};

// This will take us into edit mode and show us the edit buttons!
const editRecord = (name) => {
	console.log("Editing record for", name);
	setEditing(true);
	setDomain(name);
}

  return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
            <div className="left">
              <p className="title">⚔️ Hokage Name Service</p>
              <p className="subtitle">Your immortal API on the blockchain!</p>
            </div>
            <div className="right">
      <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
      { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
    </div>
					</header>
				</div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}
        {mints && renderMints()}

        <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <p>
            built with 
            <a
  						className="footer-text"
  						href={`${TWITTER_LINK}/_buildspace`}
  						target="_blank"
  						rel="noreferrer"
  					>_buildspace
            </a> & 
            <a
  						className="footer-text"
  						href={`${TWITTER_LINK}/Deveshb15`}
  						target="_blank"
  						rel="noreferrer"
  					>Deveshb15
            </a>
          </p>
				</div>
			</div>
		</div>
	);
}

export default App;
