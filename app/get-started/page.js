'use client';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';

const Background = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #1e1e2f 0%, #111 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const GetStartedButtonContainer = styled(motion.div)(({ theme }) => ({
  display: 'inline-block',
  zIndex: 2,
}));

const GetStartedButton = styled(Button)(({ theme }) => ({
  fontSize: '1.6rem',
  color: '#fff',
  padding: '15px 30px',
  background: 'linear-gradient(135deg, #00bfae, #0070f3)',
  borderRadius: '12px',
  boxShadow: '0px 15px 35px rgba(0, 183, 172, 0.5)',
  textTransform: 'uppercase',
  '&:hover': {
    background: 'linear-gradient(135deg, #009688, #005bb5)',
    boxShadow: '0px 20px 40px rgba(0, 183, 172, 0.7)',
  },
  '&:active': {
    boxShadow: '0px 15px 30px rgba(0, 183, 172, 0.4)',
  },
}));

const ProfessorIcon = styled(motion(Box))(({ theme }) => ({
  position: 'absolute',
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  top: '10%',
  left: '10%',
  backgroundImage: 'url(/path/to/professor-icon.png)', // Replace with actual path
  backgroundSize: 'cover',
  animation: 'float 8s ease-in-out infinite',
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-30px)',
    },
    '100%': {
      transform: 'translateY(0px)',
    },
  },
}));

const RatingStars = styled(motion(Box))(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  '& span': {
    fontSize: '3rem',
    color: '#f5c518',
    margin: '0 10px',
    animation: 'spin 15s linear infinite',
    '&:nth-child(even)': {
      color: '#ffbb33',
    },
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

const ParticleBackground = styled(motion(Box))(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  background: 'radial-gradient(circle, rgba(0, 191, 255, 0.3) 5%, rgba(0, 191, 255, 0) 80%)',
}));

const BorderMotion = styled(motion.div)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: '10px solid transparent', // Increased thickness
    borderRadius: '12px',
    zIndex: 1,
    boxSizing: 'border-box',
    borderImage: 'linear-gradient(45deg, #ff007a, #ff7e00, #00d2ff, #00ff7b) 1',
    pointerEvents: 'none',
    overflow: 'hidden',
    animation: 'borderAnimate 10s linear infinite, glow 1.5s alternate infinite',
    '@keyframes borderAnimate': {
      '0%': {
        borderImageSource: 'linear-gradient(45deg, #ff007a, #ff7e00, #00d2ff, #00ff7b)',
      },
      '50%': {
        borderImageSource: 'linear-gradient(45deg, #00ff7b, #00d2ff, #ff7e00, #ff007a)',
      },
      '100%': {
        borderImageSource: 'linear-gradient(45deg, #ff007a, #ff7e00, #00d2ff, #00ff7b)',
      },
    },
    '@keyframes glow': {
      '0%': {
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
      },
      '100%': {
        boxShadow: '0 0 30px rgba(255, 255, 255, 1)',
      },
    },
  }));
  
const particleVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.5 },  // Adjust opacity to make it more transparent
};

export default function GetStartedPage() {
  const router = useRouter();

  const handleGetStartedClick = () => {
    router.push('/chatbot');
  };

  return (
    <Background>
      <ParticleBackground
        variants={particleVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
      />
      <ProfessorIcon
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <BorderMotion />
      <Box textAlign="center" zIndex={2}>
        <Typography variant="h2" sx={{ color: '#fff', mb: 2 }}>
          RATE MY PROFESSOR!
        </Typography>
        <RatingStars
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </RatingStars>
        <Typography variant="h6" sx={{ color: '#fff', mb: 4 }}>
          Help students make informed decisions by rating their professors and sharing feedback.
        </Typography>
        <GetStartedButtonContainer
          animate={{ scale: [1, 1.05, 1] }}  // Adjusted scale values
          transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity }}  // Increased duration for slower zoom effect
        >
          <GetStartedButton
            onClick={handleGetStartedClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            Get Started
          </GetStartedButton>
        </GetStartedButtonContainer>
      </Box>
    </Background>
  );
}
