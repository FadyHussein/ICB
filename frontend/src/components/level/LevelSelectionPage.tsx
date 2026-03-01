import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardActionArea, CardContent } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../layout/Header';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { useAppState } from '../../context/AppStateContext';
import { configService } from '../../services/config.service';
import type { LevelConfig } from '../../types/api.types';

const LevelSelectionPage: React.FC = () => {
  const { program } = useParams<{ program: string }>();
  const navigate = useNavigate();
  const { selectedProgram, selectedProgramName, setLevel } = useAppState();
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true);
        const programId = program || selectedProgram || '';
        const levelsData = await configService.getLevels(programId);
        setLevels(levelsData);
      } catch (err: any) {
        setError(err?.error?.message || 'Failed to load levels');
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [program, selectedProgram]);

  const handleLevelSelect = (levelId: string, levelName: string) => {
    setLevel(levelId, levelName);
    navigate(`/${program}/levels/${levelId}/teachers`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        title={`${selectedProgramName || 'Program'} - Select Level`}
        showBack
        showHome
      />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading && <LoadingSpinner message="Loading levels..." />}
        {error && <ErrorAlert message={error} />}
        {!loading && !error && (
          <>
            <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
              Select Your Level
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
              }}
            >
              {levels.map((level) => (
                <Card
                  key={level.id}
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleLevelSelect(level.id, level.displayName)}
                    sx={{ height: '100%', minHeight: 140 }}
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h5" component="div" color="primary.main">
                        {level.displayName}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default LevelSelectionPage;
