import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import RepeatIcon from '@mui/icons-material/Repeat';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetSession } = useAppState();
  const state = location.state as any;

  const presentCount = state?.presentCount || 0;
  const totalCount = state?.totalCount || 0;
  const absentCount = totalCount - presentCount;

  const handleReturnHome = () => {
    resetSession();
    navigate('/');
  };

  const handleContinue = () => {
    navigate(-3); // Go back to attendance page
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Card elevation={8}>
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Box textAlign="center">
              <CheckCircleIcon
                sx={{
                  fontSize: 100,
                  color: 'success.main',
                  mb: 3,
                }}
              />
              
              <Typography variant="h3" gutterBottom color="success.main" fontWeight={700}>
                Success!
              </Typography>
              
              <Typography variant="h5" gutterBottom color="text.secondary">
                Attendance submitted successfully
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
                Your attendance records have been saved to the system.
              </Typography>
            </Box>

            {/* Summary Stats */}
            <Paper elevation={0} sx={{ bgcolor: 'grey.100', p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom textAlign="center" sx={{ mb: 3 }}>
                Summary
              </Typography>
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 3,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    {totalCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
                
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    {presentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present
                  </Typography>
                </Box>
                
                <Box textAlign="center">
                  <Typography variant="h4" color="error.main" fontWeight={700}>
                    {absentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent
                  </Typography>
                </Box>
              </Box>

              {presentCount > 0 && (
                <Box textAlign="center" sx={{ mt: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Attendance Rate: {Math.round((presentCount / totalCount) * 100)}%
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
              }}
            >
              <Button
                variant="outlined"
                size="large"
                startIcon={<RepeatIcon />}
                onClick={handleContinue}
                sx={{ minWidth: 200 }}
              >
                Submit More Attendance
              </Button>
              
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleReturnHome}
                sx={{ minWidth: 200 }}
              >
                Return to Home
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            Thank you for your service!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ConfirmationPage;
