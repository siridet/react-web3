import React, { useEffect ,useState} from 'react'

import { 
  AppBar, Toolbar, Typography, Button, Chip, Stack, Container, Card,
  CardContent, TextField, Divider
} from '@mui/material';

import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { ethers } from 'ethers'; 
import abi from './abi.json'


import { formatEther, parseUnits } from '@ethersproject/units';

const [metaMask, hooks] = initializeConnector((actions) => new MetaMask(actions))
const { useAccounts, useError, useIsActive, useProvider } = hooks
const contractChain = 55556
const contractAddress = '0xDd0bFE8A575765EEFeF21120dEF273244771bf6e'
const getAddressTxt = (str, s = 6, e = 6) => {
  if (str) {
    return `${str.slice(0, s)}...${str.slice(str.length - e)}`;
  }
  return "";
};

function App() {
  const [reiValue, setReiValue] = useState(0)

  const handleSetReiValue = (event) => {
    setReiValue(event.target.value)
  }

  const handleBuy = async () => {
    if (reiValue === '' || parseFloat(reiValue) === 0) {
      alert('Please enter REI')
      return
    }
    try {
      const signer = provider.getSigner()
      const smartContract = new ethers.Contract(contractAddress, abi, signer)
      const txHash = await smartContract.buy({
        from: accounts[0],
        value: parseUnits(reiValue, "ether")
      })

      smartContract.on("Buy", (from, to, tokens) => {
        console.log(from, to, tokens, txHash);
        setIsLoading(true)
      });
    } catch (err) {
      console.log(err)
    }
  }

  const provider = useProvider()
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState('')


  const accounts = useAccounts()
  const connector = metaMask
  const isActive = useIsActive()
  const error = useError()
  // useEffect(() => {
  //   const fetchToken = async () => {
  //     try {
  //       const signer = provider.getSigner()
  //       const smartContract = new ethers.Contract(contractAddress, abi, signer)
  //       const myBalance = await smartContract.balanceOf(accounts[0])
  //       setBalance(formatEther(myBalance))
  //     } catch (err) {
  //       console.log(err)
  //     }
  //   }

  //   if (isLoading) {
  //     void metaMask.connectEagerly()
  //     setIsLoading(false)
  //   }
  //   if (isActive && !isLoading) {
  //     fetchToken()
  //   }
  //   if (error) {
  //     alert(error.message)
  //   }

  // }, [error, isLoading, isActive, accounts, provider])

  useEffect(() => {

    const fetchToken = async () => {
      try {
        const signer = provider.getSigner()
        const smartContract = new ethers.Contract(contractAddress, abi, signer)
        const myBalance = await smartContract.balanceOf(accounts[0])
        setBalance(formatEther(myBalance))

      } catch (err) {
        console.log(err)
      }
    }
    if (isLoading) {
      void metaMask.connectEagerly()
      setIsLoading(false)
    }
    if (isActive && !isLoading) {
      fetchToken()
    }
    if (error) {
      alert(error.message)
    }

    void metaMask.connectEagerly()
    if (error) {
      alert(error.message)
    }
  }, [error])

  const handleConnect = () => {
    connector.activate(contractChain)
  }

  const handleDisconnect = () => {
    connector.deactivate()
  }

  return (
    <div>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My DApp
          </Typography>

          {!isActive ?
            <Button variant="contained"
              color="inherit"
              onClick={handleConnect}
            >
              Connect to Wallet
            </Button>
            :
            <Stack direction="row" spacing={1}>
              <Chip label={getAddressTxt(accounts[0])} />
              <Button variant="contained"
                color="inherit"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </Stack>
          }
        </Toolbar>
      </AppBar>  <br></br> 
      
      <Divider/>
                  <Typography variant="body1">
                    Buy MTK (1 REI = 10 MKT)
                  </Typography>
                  <TextField
                    required
                    id="outlined-required"
                    label="REI"
                    defaultValue=""
                    type="number"
                    onChange={handleSetReiValue}
                  />
                  <Button variant="contained" onClick={handleBuy}>Buy</Button>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        { isActive &&
          <div>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" align="center">
                    MTK
                  </Typography>
                  <TextField
                    id="address"
                    label="Address"
                    value={accounts[0]}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <TextField
                    id="balance"
                    label="MKT Balance"
                    value={balance}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </div>
        }
      </Container>

    </div>
  );
}

export default App;
