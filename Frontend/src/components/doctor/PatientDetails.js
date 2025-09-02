import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Divider, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CameraAlt, Videocam, Mic, ScreenShare, CallEnd } from '@mui/icons-material';

const PatientDetails = ({ patient, onBack }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [showConsultationDialog, setShowConsultationDialog] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Patient details with sample data
  const patientDetails = {
    name: patient?.name || 'N/A',
    age: patient?.age || 'N/A',
    gender: patient?.gender || 'N/A',
    bloodGroup: patient?.blood_group || 'N/A',
    contact: patient?.telephone || 'N/A',
    address: patient?.address || 'N/A',
    medicalHistory: patient?.medical_history || [],
    vitals: patient?.vitals || {}
  };

  // Request camera access
  const requestCameraAccess = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setPermissionGranted(true);
      }
      return true;
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check your permissions.');
      return false;
    }
  };

  // Start consultation
  const startConsultation = async () => {
    const hasPermission = await requestCameraAccess();
    if (hasPermission) {
      setShowConsultationDialog(true);
      setCameraActive(true);
    }
  };

  // End consultation
  const endConsultation = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setShowConsultationDialog(false);
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        variant="outlined" 
        onClick={onBack}
        sx={{ mb: 2 }}
      >
        ← Back to Patient List
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Patient Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              <strong>Name:</strong> {patientDetails.name}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Age:</strong> {patientDetails.age}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Gender:</strong> {patientDetails.gender}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Blood Group:</strong> {patientDetails.bloodGroup}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              <strong>Contact:</strong> {patientDetails.contact}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Address:</strong> {patientDetails.address}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Videocam />}
            onClick={startConsultation}
            sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
          >
            Start Consultation
          </Button>
        </Box>
      </Paper>

      {/* Vitals Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Vitals
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" color="textSecondary">Blood Pressure</Typography>
            <Typography variant="h6">
              {patientDetails.vitals.blood_pressure || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" color="textSecondary">Pulse</Typography>
            <Typography variant="h6">
              {patientDetails.vitals.pulse ? `${patientDetails.vitals.pulse} bpm` : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" color="textSecondary">SpO2</Typography>
            <Typography variant="h6">
              {patientDetails.vitals.spo2 ? `${patientDetails.vitals.spo2}%` : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" color="textSecondary">Temperature</Typography>
            <Typography variant="h6">
              {patientDetails.vitals.temperature ? `${patientDetails.vitals.temperature}°F` : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" color="textSecondary">BMI</Typography>
            <Typography variant="h6">
              {patientDetails.vitals.bmi || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Medical History Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Medical History
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {patientDetails.medicalHistory.length > 0 ? (
          patientDetails.medicalHistory.map((record, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1">
                <strong>{record.date}</strong> - {record.diagnosis}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {record.treatment}
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary">
                Treated by {record.doctor} at {record.hospital}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No medical history available.
          </Typography>
        )}
      </Paper>

      {/* Consultation Dialog */}
      <Dialog
        open={showConsultationDialog}
        onClose={endConsultation}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Video Consultation - {patientDetails.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            position: 'relative', 
            paddingTop: '56.25%', // 16:9 aspect ratio
            backgroundColor: '#000',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 2
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {!cameraActive && (
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                textAlign: 'center'
              }}>
                <CameraAlt sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Camera is starting...</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <IconButton 
            color="primary" 
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
              mr: 2
            }}
          >
            <Mic />
          </IconButton>
          <IconButton 
            color="primary" 
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
              mr: 2
            }}
          >
            <ScreenShare />
          </IconButton>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<CallEnd />}
            onClick={endConsultation}
            sx={{ 
              borderRadius: '50px',
              px: 4,
              '&:hover': { backgroundColor: 'error.dark' }
            }}
          >
            End Call
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientDetails;
