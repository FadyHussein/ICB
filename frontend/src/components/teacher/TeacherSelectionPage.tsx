import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardActionArea, CardContent, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../layout/Header';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { useAppState } from '../../context/AppStateContext';
import { teachersService } from '../../services/teachers.service';
import type { Teacher } from '../../types/teacher.types';

const TeacherSelectionPage: React.FC = () => {
  const { program, level } = useParams<{ program: string; level: string }>();
  const navigate = useNavigate();
  const { selectedProgramName, selectedLevelName, setTeacher } = useAppState();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const teachersData = await teachersService.getTeachers(program, level);
        setTeachers(teachersData);
      } catch (err: any) {
        setError(err?.error?.message || 'Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [program, level]);

  const handleTeacherSelect = (teacher: Teacher) => {
    setTeacher(teacher);
    navigate(`/${program}/levels/${level}/attendance`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        title={`${selectedProgramName} - ${selectedLevelName}`}
        showBack
        showHome
      />
      <Container maxWidth="md" sx={{ py: 4 }}>
        {loading && <LoadingSpinner message="Loading teachers..." />}
        {error && <ErrorAlert message={error} />}
        {!loading && !error && (
          <>
            <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
              Select Your Name
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              {teachers.map((teacher) => (
                <Card
                  key={teacher.teacherId}
                  elevation={3}
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleTeacherSelect(teacher)}
                    sx={{ p: 2 }}
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <PersonIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        {teacher.teacherName}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
            {teachers.length === 0 && (
              <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
                No teachers found for this level.
              </Typography>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default TeacherSelectionPage;
