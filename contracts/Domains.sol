// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import {Base64} from "./libraries/Base64.sol";
import { StringUtils } from "./libraries/StringUtils.sol";

import "hardhat/console.sol";

error Unauthorized();
error AlreadyRegistered();
error InvalidName(string name);

contract Domains is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address payable public owner;
    string public tld;

    string svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#a)" d="M0 0h270v270H0z"/><defs><filter id="b" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="m76.02 51-2.794-9.005L80.02 37l-9.494-2.206L74.02 27l-10.695 4.194L65.02 23l-8.493 6.394L53.02 21l-5.897 7.494L39.02 23l-.899 8.194L29.02 29l2.763 7.595L25.02 41l5 2-3 8 6-4.667v5.359c-.696.162-1.271.313-1.521.384l-1.408.401-.043 1.463c-.003.119-.085 2.927.001 4.661.227 4.468 2.504 7.552 5.942 8.249C38.341 73.694 45.311 80 48.516 80h.016c.701-.005 1.876-.004 2.674-.002V80l.419-.001.429.001v-.002c.732-.001 1.773-.002 2.453.002h.016c3.255 0 10.352-6.428 12.638-13.348 3.389-.731 5.632-3.797 5.857-8.227.088-1.736.005-4.377.001-4.489l-.047-1.46-1.661-.474c-.344-.1-.794-.229-1.291-.359v-3.408l6 2.765zm-29.418-2.396 1.722-4c.003-.008.01-.012.013-.019.419-1.948 2.207-3.46 4.401-3.584 1.6-.089 2.64.042 3.171.146l2.186-1.028a1 1 0 1 1 .852 1.81l-2.5 1.176a.996.996 0 0 1-.728.048s-.926-.266-2.868-.155c-1.449.082-2.594 1.152-2.608 2.437-.007.699.265 1.38.747 1.871.437.444.995.69 1.574.694.787.004 1.417-.173 1.72-.502.237-.257.262-.586.242-.816a.547.547 0 0 0-.364-.477c-.239-.095-.612-.095-.946.196a1 1 0 1 1-1.315-1.507c.848-.74 2-.949 3.006-.545a2.532 2.532 0 0 1 1.611 2.155c.08.895-.191 1.729-.762 2.349-.485.524-1.425 1.147-3.161 1.147h-.044c-.05 0-.099-.014-.149-.016-.028.002-.052.016-.08.016H47.52a1 1 0 0 1-.918-1.396zm22.42 9.618c-.07 1.383-.549 4.601-3.477 4.601h-2v1.979c-.018.066-.041.132-.06.198H56.02l6.364 2.71c-.231.44-.481.87-.745 1.29H57.02l3.24 1.954c-.286.364-.576.712-.87 1.046h-3.37l1.817 1.625C56.39 75.004 55.099 75.89 54.532 76c-.866-.005-2.32-.003-2.985-.001-.765-.001-2.192-.002-2.942.008-.58-.11-1.818-.938-3.211-2.24L47.02 72l-3.334-.007c-.26-.297-.517-.605-.771-.924L46.02 69h-4.573a18.769 18.769 0 0 1-.521-.889L47.02 65h-7.414c-.027-.094-.061-.188-.086-.283V63h-2c-2.927 0-3.407-3.218-3.477-4.6-.041-.812-.039-1.934-.028-2.834.419-.096.86-.188 1.278-.266.014-.002.028 0 .042-.002.228-.036.456-.061.684-.096l2 4.797 1.025-5.221c1.413-.175 2.823-.324 4.231-.44a2.496 2.496 0 0 0-1.27 2.167 2.508 2.508 0 0 0 5.014 0c0-1.04-.636-1.932-1.54-2.311a99.932 99.932 0 0 1 12.126-.016 2.504 2.504 0 0 0 .913 4.834 2.5 2.5 0 0 0 1.174-4.706c1.405.114 2.803.261 4.196.436L65.02 60l1.846-4.824c.274.043.551.074.825.12.11.019.22.027.33.027.048 0 .095-.009.143-.013.298.065.6.138.888.214.01.847.011 1.9-.03 2.698z" fill="#fff"/><defs><linearGradient id="a" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#FF9671"/><stop offset="1" stop-color="#E57B89" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="25" fill="#fff" filter="url(#b)" font-family="Poppins ,sans-serif" font-weight="bold">';
    string svgPartTwo = '</text></svg>';

    // mapping domain name to address
    mapping(string => address) public domains;
    // mapping character
    mapping(string => string) public characters;
    // mapping images
    mapping(string => string) public links;

    // mapping names
    mapping(uint => string) public names;

    constructor(string memory _tld) payable ERC721("Hokage Name Service", "HOKAGE") {
        owner = payable(msg.sender);
        tld = _tld;
        console.log("%s name service deployed ", _tld);
    }

    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    function isOwner() public view returns(bool) {
        return msg.sender==owner;
    }

    function withdraw() public onlyOwner {
        uint amount = address(this).balance;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw matic!!");
    }

    function valid(string calldata name) public pure returns(bool) {
        return StringUtils.strlen(name) >= 3 && StringUtils.strlen(name) <= 10;
    }

    function price(string calldata name) public pure returns(uint) {
        uint len = StringUtils.strlen(name);
        require(len > 0);

        if(len==3) {
            return 5 * (10**17);
        } else if(len == 4) {
            return 3 * (10**17);
        } else {
            return 1 * (10**17);
        }
    }

    function register(string calldata name) public payable {
        // check if domain is unregistered
        require(domains[name]==address(0), "Name already taken");
        if (domains[name] != address(0)) revert AlreadyRegistered();
        if (!valid(name)) revert InvalidName(name);

        uint _price = this.price(name);
        // check if user has enough matic
        require(msg.value >= _price, "Not enough Matic paid");

        // For nfts
        string memory _name = string(abi.encodePacked(name,'.', tld));
        string memory finalSvg = string(abi.encodePacked(svgPartOne, _name, svgPartTwo));
        uint256 newRecordId = _tokenIds.current();
        uint256 length = StringUtils.strlen(name);
        string memory strLen = Strings.toString(length);

        console.log("Registering %s.%s on contract with tokenID %s", name, tld, newRecordId);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        _name,
                        '", "description": "A domain on the Hokage name service", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '","length":"',
                        strLen,
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenUri = string( abi.encodePacked("data:application/json;base64,", json));

        console.log("\n--------------------------------------------------------");
        console.log("Final tokenURI", finalTokenUri);
        console.log("--------------------------------------------------------\n");

        _safeMint(msg.sender, newRecordId);
        _setTokenURI(newRecordId, finalTokenUri);

        domains[name] = msg.sender;
        names[newRecordId] = name;

        _tokenIds.increment();
    }

    function setCharacter(string calldata name, string calldata character) public {
        require(domains[name]==msg.sender, "You can only set favorite character for your account!");
        if (msg.sender != domains[name]) revert Unauthorized();
        characters[name] = character;
    }

    function setCharacterLink(string calldata name, string calldata link) public {
        require(domains[name]==msg.sender, "You can only set character image link for your account!");
        if (msg.sender != domains[name]) revert Unauthorized();
        links[name] = link;
    }

    function getAddress(string calldata name) public view returns(address) {
        return domains[name];
    }

    function getCharacter(string calldata name) public view returns(string memory) {
        return characters[name];
    }

    function getCharacterLink(string calldata name) public view returns(string memory) {
        return links[name];
    }

    function getAllNames() public view returns (string[] memory) {
        console.log("Getting all names from contract");
        string[] memory allNames = new string[](_tokenIds.current());

        for(uint i = 0; i < _tokenIds.current(); i++) {
            allNames[i] = names[i];
            console.log("Name for token %d is %s", i, allNames[i]);
        }

        return allNames;
    }
}

