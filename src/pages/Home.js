import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import BarChart from '../components/bar-chart';
import  Toolbar  from '@mui/material/Toolbar';
import  Button  from '@mui/material/Button';
import { COLUMNS } from '../constants/columns'; 
import Histogram from '../components/histogram';
import '../App.css';
import ScatterPlot from '../components/scatter-plot';
import SpotifyLight from '../public/spotify-light.jpeg';
import SpotifyDark from '../public/spotify-dark.png';

function getKeys(column, val) {
    const keyMap = {
        'C': 0,
        'C#': 1,
        'D': 2,
        'D#': 3,
        'E': 4,
        'F': 5,
        'F#': 6,
        'G': 7,
        'G#': 8,
        'A': 9,
        'A#': 10,
        'B': 11
    };
    if(column === 'mode') {
        if(val === 'Major'){
            return 1
        } else {
            return 0
        }
    } else if(column === 'key') {
        return keyMap[val]
    }
}
async function GetData() {
    const csv = await fetchCsv();
    const data = Papa.parse(csv).data;
    const modifiedData = await data.slice(1).map(row => {
        const obj = {};
        data[0].forEach((col, index) => {
          obj[col] = row[index];
          if(col === 'artist(s)_name') {
            obj.numArtists = row[index]?.split(',').length
          } else if(col === 'mode') {
            obj.modeIndex = getKeys(col, row[index])
          } else if(col === 'key') {
            obj.keyIndex = getKeys(col, row[index])
          }
        });
        return obj;
    });
    return modifiedData;
}

async function fetchCsv() {
    const response = await fetch('/spotify-2023.csv');
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder('utf-8');
    const csv = await decoder.decode(result.value);
    return csv;
}


function countAuthors(rows) {
    const authorCounts = {};
    const countKeys = {}
    const countMode = {}

    rows?.forEach(row => {
        const authors = row['artist(s)_name']?.split(','); 
        const mode = row['mode']
        const keyMap = row['key']
        if (countMode.hasOwnProperty(mode)) {
            countMode[mode]++;
        } else {
            countMode[mode] = 1;
        }

        if (countKeys.hasOwnProperty(keyMap)) {
            countKeys[keyMap]++;
        } else {
            countKeys[keyMap] = 1;
        }
    
        authors?.forEach(author => {
            const trimmedAuthor = author.trim();
            if (authorCounts.hasOwnProperty(trimmedAuthor)) {
                authorCounts[trimmedAuthor]++;
            } else {
                authorCounts[trimmedAuthor] = 1;
            }
        });
    });
    return { authorCounts, countMode, countKeys };
}



const Home = () => {
    const [jsonData, setJsonData] = useState([]);
    const [themeLight, setThemeType] = useState(false);
    const [showScatterPlot, setShowScatterPlot] = useState(false)
    const [isSideways, setIsSideWays] = useState(false);
    const [inverted, setInverted] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState('artist(s)_name')
    const [selectedData, setSelectedData] = useState([])
    const [doubleClickedItems, setDoubleClickedItems] = useState(''); 
    const [selectedDoubleData, setSelectedDoubleData] = useState([])
    const clickTimeoutRef = useRef(null); 
    const { authorCounts, countMode, countKeys } = countAuthors(jsonData)
    const data1 = selectedData[0]?.column_name === 'artist(s)_name' ? authorCounts 
        : (selectedData[0]?.column_name === 'key') ? countKeys 
        : (selectedData[0]?.column_name === 'mode') ? countMode 
        : {}
    const data2 = selectedDoubleData[0]?.column_name === 'artist(s)_name' ? authorCounts 
        : (selectedDoubleData[0]?.column_name === 'key') ? countKeys 
        : (selectedDoubleData[0]?.column_name === 'mode') ? countMode 
        : {}

    const handleToggleChange = () => {
        setIsSideWays(!isSideways);
    };

    const handleInvertedChange = () => {
        setInverted(!inverted);
    }

    const handleScatterToggleChange = () => {
        setShowScatterPlot(!showScatterPlot)
    }

    const handleColumnClick = (column_name) => {
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
            setDoubleClickedItems(prevItems => {
                const isAlreadyAdded = prevItems === (column_name);
                return isAlreadyAdded ? '' : column_name;
            });
            setShowScatterPlot(false)
        } else {
            clickTimeoutRef.current = setTimeout(() => {
                setSelectedColumns(column_name);
                clickTimeoutRef.current = null;
            }, 300);
        }
    };

    const theme = createTheme({
        palette: {
            mode: themeLight ? "dark" : "light",
        },
    });
    function handleThemeChange() {
        setThemeType(!themeLight);
    }

    useEffect(() => {
        setShowScatterPlot(false)
        setIsSideWays(false)
        setSelectedData(COLUMNS.filter(el => el.column_name === selectedColumns))
    }, [selectedColumns])

    useEffect(() => {
        setSelectedDoubleData(COLUMNS.filter(el => el.column_name === doubleClickedItems))
    }, [doubleClickedItems])

    useEffect(() => {
        async function fetchData() {
            const modifiedData = await GetData();
            setJsonData(modifiedData);
        }
        fetchData();
    }, [])
    const backgroundColor = theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)';
    const hoverBackgroundColor = theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)';
    const activeBackgroundColor = theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)';
    const cols = ['artist(s)_name', 'mode', 'key']
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ height: '100vh' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="sticky" style={{backgroundColor: '#1DB954'}}>
                        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h5">
                                Visualisation - 564
                            </Typography>
                            <Switch
                                checked={themeLight}
                                onChange={handleThemeChange}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        </Toolbar>
                    </AppBar>
                </Box>
                <Box sx={{margin: '20px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <img src={theme.palette.mode === 'light' ? SpotifyLight : SpotifyDark} alt="Spotigy Inc. logo" style={{
                        width: 40,
                        height: 40
                    }} />
                    <h2 style={{marginLeft: 20}}>Spotify Hitlist 2023 Analytics</h2>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 6fr' }}>
                    <Box
                    sx={{
                        height: '80vh', 
                        overflow: 'scroll', 
                        padding: 1
                    }}
                    >
                        {COLUMNS.map(({title,categorical,column_name}) => (
                            <Typography key={column_name}>
                            <Button
                                onClick={() => handleColumnClick(column_name)}
                                sx={{
                                    width: '180px', 
                                    backgroundColor: (selectedColumns === column_name || doubleClickedItems === column_name) ? backgroundColor : 'transparent',
                                    '&:hover': {
                                        backgroundColor: hoverBackgroundColor,
                                        cursor: 'pointer'
                                    },
                                    '&:active': {
                                        backgroundColor: activeBackgroundColor,
                                    },
                                    color: theme.palette.mode === 'light' ? 'black':'white'
                                }}
                            >
                                {title}
                            </Button>
                            </Typography>
                        ))}
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateRows: '1fr 8fr' }}>
                        <Box sx={{display: 'flex', justifyContent: 'end', marginRight: '50px'}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="h6">
                                    Show Scatterplot:
                                </Typography>
                                <Switch
                                    sx={{
                                        marginRight: '1rem' ,
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                          color: '#1DB954',
                                          '&:hover': {
                                            backgroundColor: 'rgba(144, 238, 144, 0.08)', 
                                          },
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                          backgroundColor: '#1DB954',
                                        },
                                        '& .MuiSwitch-track': {
                                          backgroundColor: '#ccc', 
                                        },
                                      }}
                                    checked={showScatterPlot}
                                    onChange={handleScatterToggleChange}
                                    inputProps={{ 'aria-label': 'toggle scatter plot' }}
                                    disabled={doubleClickedItems === ''}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', width: '200px' }}>
                                <Typography variant="h6">
                                    Graph:
                                </Typography>
                                <Switch
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#1DB954',
                                            '&:hover': {
                                              backgroundColor: 'rgba(144, 238, 144, 0.08)', 
                                            },
                                          },
                                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#1DB954',
                                          },
                                          '& .MuiSwitch-track': {
                                            backgroundColor: '#ccc', 
                                          },
                                    }}
                                    checked={isSideways}
                                    onChange={handleToggleChange}
                                    disabled={showScatterPlot}
                                    inputProps={{ 'aria-label': 'toggle graph orientation' }}
                                />
                                <Typography variant="body1" style={{ marginLeft: '0.5rem' }}>
                                    {isSideways ?  'Sideways': 'Upright'}
                                </Typography>
                            </div>
                        </Box>
                        {
                            showScatterPlot ? (
                                <Box sx={{ display: 'flex'}}>
                                    <ScatterPlot 
                                        theme={theme.palette.mode} 
                                        xAxisName={!inverted ? selectedData[0]?.column_name : selectedDoubleData[0]?.column_name} 
                                        yAxisName={!inverted ? selectedDoubleData[0]?.column_name : selectedData[0]?.column_name} 
                                        data={jsonData.map(row => (
                                            !inverted ? [cols.includes(selectedColumns) ? row[selectedData[0]?.column_index] : row[selectedData[0]?.column_name], cols.includes(doubleClickedItems) ? row[selectedDoubleData[0]?.column_index] : row[selectedDoubleData[0]?.column_name]]
                                            : [cols.includes(doubleClickedItems) ? row[selectedDoubleData[0]?.column_index] : row[selectedDoubleData[0]?.column_name], cols.includes(selectedColumns) ? row[selectedData[0]?.column_index] : row[selectedData[0]?.column_name]]
                                        ))} 
                                        width={900} 
                                        height={500} />
                                    <div style={{marginTop: "20px"}}>
                                    <Typography variant="h6">
                                            X-Axis:
                                    </Typography>
                                    <div style={{ display: 'flex', alignItems: 'center'}}>
                                        <Typography variant="body1" style={{ marginLeft: '0.5rem' }}>
                                            {selectedData[0]?.column_name}
                                        </Typography>
                                        <Switch
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: '#1DB954',
                                                    '&:hover': {
                                                      backgroundColor: 'rgba(144, 238, 144, 0.08)', 
                                                    },
                                                  },
                                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                    backgroundColor: '#1DB954',
                                                  },
                                                  '& .MuiSwitch-track': {
                                                    backgroundColor: '#ccc', 
                                                  },
                                            }}
                                            checked={inverted}
                                            onChange={handleInvertedChange}
                                            inputProps={{ 'aria-label': 'toggle axis orientation' }}
                                        />
                                        <Typography variant="body1" style={{ marginLeft: '0.5rem' }}>
                                            {selectedDoubleData[0]?.column_name}
                                        </Typography>
                                    </div>
                                    </div>
                                </Box>
                            ) : selectedData[0]?.categorical ? (
                                <BarChart theme={theme.palette.mode} data={data1} width={1000} height={500} xAxisName={!isSideways ? selectedData[0]?.column_name : 'count'} yAxisName={!isSideways ? 'count': selectedData[0]?.column_name} isSideways={isSideways}  />
                            ) : (
                                <Histogram theme={theme.palette.mode} data={jsonData.map(row => row[selectedData[0]?.column_name])} xAxisName={!isSideways ? selectedData[0]?.column_name : 'count'} yAxisName={!isSideways ? 'count': selectedData[0]?.column_name} width={1000} height={500} bins={10} isSideways={isSideways} />
                            )
                        }
                    </Box>
                </Box>
            </div>
        </ThemeProvider>
    );
};

export default Home;