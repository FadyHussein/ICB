import React from 'react';
import { Box, Container, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setProgram } = useAppState();

  const handleProgramSelect = (program: string, programName: string) => {
    setProgram(program, programName);
    navigate(`/${program}/levels`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1B5E20 0%, #4C8C4A 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center" mb={6}>
          {/* ICB Logo */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <img
              src="/icb-logo.svg"
              alt="Islamic Center of Boise Logo"
              style={{
                height: '120px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                opacity: 0.95,
              }}
            />
          </Box>
          
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Islamic Center of Boise
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: '#FFB300',
              fontWeight: 600,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Sunday School Attendance
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Card
              elevation={8}
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 12,
                },
              }}
            >
              <CardActionArea
                onClick={() => handleProgramSelect('iqra', 'Iqra')}
                sx={{ height: '100%', minHeight: 250 }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    p: 4,
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h3" component="h2" gutterBottom>
                    Iqra Tracking
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    Track attendance and progress for Iqra program
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card
              elevation={8}
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 12,
                },
              }}
            >
              <CardActionArea
                onClick={() => handleProgramSelect('islamic-studies', 'Islamic Studies')}
                sx={{ height: '100%', minHeight: 250 }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    p: 4,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h3" component="h2" gutterBottom>
                    Islamic Studies Tracking
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    Track attendance and progress for Islamic Studies program
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        </Box>

        <Box textAlign="center" mt={6}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
            Version 1.0.0 | Islamic Center of Boise
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
