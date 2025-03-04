
// This is a mock implementation for demonstration
// In a production app, you would use ethers.js or web3.js to interact with smart contracts

// Mock ABI for SportCourse NFT contract
export const SPORT_COURSE_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getOwnedCourses",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getCreatedCourses",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "uri",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "createCourse",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "bookCourse",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Mock contract address
export const SPORT_COURSE_ADDRESS = "0x1234567890123456789012345678901234567890";

// Mock functions to interact with the contract
export const createCourse = async (
  uri: string,
  price: string,
  duration: number
): Promise<string> => {
  // Simulate blockchain transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  return `${Math.floor(Math.random() * 1000000)}`;
};

export const bookCourse = async (
  tokenId: string,
  price: string
): Promise<boolean> => {
  // Simulate blockchain transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  return true;
};

export const getCourseDetails = async (
  tokenId: string
): Promise<any> => {
  // Simulate blockchain call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock course data
  return {
    uri: "ipfs://QmHash123456",
    price: "0.05",
    duration: 7,
    trainer: "0x1234...5678",
    isBooked: false,
    bookedAt: 0,
    expiresAt: 0
  };
};

// Sample Solidity contract code (not used in the app, just for reference)
export const SPORT_COURSE_CONTRACT_CODE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SportCourse is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct Course {
        uint256 price;
        uint256 duration; // in days
        address trainer;
        bool isActive;
    }
    
    struct Booking {
        address user;
        uint256 bookedAt;
        uint256 expiresAt;
    }
    
    mapping(uint256 => Course) public courses;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public trainerCourses;
    mapping(address => uint256[]) public userBookings;
    
    event CourseCreated(uint256 indexed tokenId, address indexed trainer, uint256 price, uint256 duration);
    event CourseBooked(uint256 indexed tokenId, address indexed user, uint256 bookedAt, uint256 expiresAt);
    event CourseExpired(uint256 indexed tokenId, address indexed user);
    
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}
    
    function createCourse(string memory uri, uint256 price, uint256 duration) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        courses[newTokenId] = Course(price, duration, msg.sender, true);
        trainerCourses[msg.sender].push(newTokenId);
        
        emit CourseCreated(newTokenId, msg.sender, price, duration);
        
        return newTokenId;
    }
    
    function bookCourse(uint256 tokenId) public payable {
        Course memory course = courses[tokenId];
        require(course.isActive, "Course is not active");
        require(course.trainer != msg.sender, "Cannot book your own course");
        require(msg.value >= course.price, "Insufficient payment");
        
        uint256 expirationTime = block.timestamp + (course.duration * 1 days);
        
        bookings[tokenId] = Booking(msg.sender, block.timestamp, expirationTime);
        userBookings[msg.sender].push(tokenId);
        
        payable(course.trainer).transfer(msg.value);
        
        emit CourseBooked(tokenId, msg.sender, block.timestamp, expirationTime);
    }
    
    function checkExpiration(uint256 tokenId) public {
        Booking memory booking = bookings[tokenId];
        require(booking.user != address(0), "Course not booked");
        
        if (block.timestamp > booking.expiresAt) {
            // Remove booking
            delete bookings[tokenId];
            
            // Remove from user bookings (simplified, would be more complex in production)
            emit CourseExpired(tokenId, booking.user);
        }
    }
    
    function getOwnedCourses(address user) public view returns (uint256[] memory) {
        return userBookings[user];
    }
    
    function getCreatedCourses(address trainer) public view returns (uint256[] memory) {
        return trainerCourses[trainer];
    }
}
`;
