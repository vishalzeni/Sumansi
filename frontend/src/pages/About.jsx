import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Avatar,
  Button,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import colors from '../colors';

// MUI Icons
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VerifiedIcon from '@mui/icons-material/Verified';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};


const highlights = [
  {
    title: 'Our Philosophy',
    description: 'We believe fashion should be inclusive, expressive, and empowering. Every piece is designed with you in mind.',
    icon: <TrackChangesIcon sx={{ fontSize: 32 }} />, 
    color: colors.primary
  },
  {
    title: 'Sustainable Style',
    description: 'Our collections blend modern trends with sustainable practices, prioritizing people and the planet.',
    icon: <VisibilityIcon sx={{ fontSize: 32 }} />, 
    color: colors.primary
  },
  {
    title: 'Made for You',
    description: 'From workwear to weekend fits, our styles adapt to your lifestyle—without compromising on comfort or elegance.',
    icon: <FavoriteIcon sx={{ fontSize: 32 }} />, 
    color: colors.primary
  },
  {
    title: 'Confidence in Every Stitch',
    description: 'Every piece is designed to make women feel bold, beautiful, and unapologetically themselves.',
    icon: <VerifiedIcon sx={{ fontSize: 32 }} />, 
    color: colors.primary
  }
];

const stats = [
  { value: '200K+', label: 'Happy Customers', icon: <FavoriteIcon /> },
  { value: '2018', label: 'Established In', icon: <TimelineIcon /> },
  { value: '500+', label: 'Styles Available', icon: <VisibilityIcon /> },
  { value: '25+', label: 'Countries Shipped To', icon: <RocketLaunchIcon /> }
];

const renderStats = () => stats.map((stat, index) => (
  <Grid item xs={6} sm={3} key={index}>
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={slideUp}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          textAlign: 'center',
          boxShadow: 'none',
          backgroundColor: colors.cardBg,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Avatar
          sx={{
            bgcolor: `${colors.primary}20`,
            color: colors.primary,
            width: 56,
            height: 56,
            mb: 2
          }}
        >
          {stat.icon}
        </Avatar>
        <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary, mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}>
          {stat.value}
        </Typography>
        <Typography variant="body1" sx={{ color: colors.textSecondary, fontSize: '1rem' }}>
          {stat.label}
        </Typography>
      </Card>
    </motion.div>
  </Grid>
));

const renderHighlights = () => highlights.map((item, index) => (
  <Grid item xs={12} md={4} key={index}>
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={slideUp}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          maxWidth: 250,
          height: '100%',
          borderLeft: `4px solid ${item.color}`,
          boxShadow: `0 8px 24px ${colors.primary}10`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 12px 28px ${colors.primary}20`
          }
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: `${item.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            color: item.color,
            mx: 'auto'
          }}
        >
          {item.icon}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: colors.primary, fontSize: '1.5rem', textAlign: 'center' }}>
          {item.title}
        </Typography>
        <Typography variant="body1" sx={{ color: colors.textSecondary, lineHeight: 1.7, textAlign: 'center' }}>
          {item.description}
        </Typography>
      </Card>
    </motion.div>
  </Grid>
));

const About = () => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
    <Header/>
    <Box sx={{ backgroundColor: colors.background, py: { xs: 4, md: 6 } }} role="main" aria-label="About Us Page">
      <Container maxWidth="xl">

        {/* Hero Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: { xs: 6, md: 10 },
            mb: { xs: 4, md: 6 }
          }}
        >
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Chip
              label="About Us"
              sx={{
                mb: 3,
                backgroundColor: colors.primary,
                color: 'white',
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                lineHeight: 1.2,
                mb: 3,
                background: colors.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Fashion That Empowers Every Woman
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', color: colors.textSecondary }}>
              From timeless essentials to bold statements, we create clothing that celebrates confidence, comfort, and individuality.
            </Typography>
          </motion.div>
        </Box>

       

        {/* Highlights */}
        <Box sx={{ py: { xs: 4, md: 6 }, mb: { xs: 4, md: 8 } }}>
          <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 700, mb: { xs: 4, md: 6 }, color: colors.primary, fontSize: { xs: '2rem', md: '2.5rem' } }}>
            What Drives Us
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {renderHighlights()}
          </Grid>
        </Box>

 {/* Stats */}
        <Box sx={{ py: { xs: 4, md: 6 }, mb: { xs: 4, md: 8 } }}>
          <Grid container spacing={3} justifyContent="center">
            {renderStats()}
          </Grid>
        </Box>
        {/* Contact CTA */}
        <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' }, mb: 3, color: colors.primary }}>
            Got Questions or Suggestions?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: colors.textSecondary }}>
            We’d love to hear from you. Reach out to our team anytime.
          </Typography>
          <Button
            component={Link}
            to="/contact"
            variant="contained"
            endIcon={<ArrowForwardIosIcon />}
            sx={{ fontWeight: 600, fontSize: '1rem', px: 4, py: 1.5, backgroundColor: colors.primary }}
          >
            Contact Us
          </Button>
        </Box>

      </Container>
    </Box>
    <Footer/>
    </>
  );
};

export default About;
