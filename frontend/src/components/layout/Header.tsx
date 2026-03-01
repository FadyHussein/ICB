import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false, showHome = false, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {showBack && (
          <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {showHome && (
          <IconButton color="inherit" onClick={handleHome}>
            <HomeIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
