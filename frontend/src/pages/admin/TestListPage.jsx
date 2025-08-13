import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TestListPage = () => {
  const navigate = useNavigate();
  
  // State for tests data
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalTests: 0,
    activeTests: 0,
    upcomingTests: 0,
    completedTests: 0
  });

  // Fetch tests data
  const fetchTests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(
        `${API_BASE_URL}/admin/tests`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setTests(response.data.data);
        
        // Calculate statistics
        const now = new Date();
        const completedTests = response.data.data.filter(test => 
          new Date(test.endTime) < now
        ).length;
        
        const activeTests = response.data.data.filter(test => {
          const startTime = new Date(test.startTime);
          const endTime = new Date(test.endTime);
          return startTime <= now && endTime >= now;
        }).length;
        
        const upcomingTests = response.data.data.filter(test => 
          new Date(test.startTime) > now
        ).length;
        
        setStats({
          totalTests: response.data.data.length,
          activeTests,
          upcomingTests,
          completedTests
        });
      } else {
        setError(response.data.error || 'Failed to load tests');
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError(err.response?.data?.error || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  // Filter tests based on search term and status
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    let matchesStatus = true;
    
    if (filterStatus === 'active') {
      const startTime = new Date(test.startTime);
      const endTime = new Date(test.endTime);
      matchesStatus = startTime <= now && endTime >= now;
    } else if (filterStatus === 'upcoming') {
      matchesStatus = new Date(test.startTime) > now;
    } else if (filterStatus === 'completed') {
      matchesStatus = new Date(test.endTime) < now;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get test status
  const getTestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) {
      return {
        label: 'Upcoming',
        color: 'warning'
      };
    } else if (now >= start && now <= end) {
      return {
        label: 'Active',
        color: 'success'
      };
    } else {
      return {
        label: 'Completed',
        color: 'default'
      };
    }
  };

  // Initialize component
  useEffect(() => {
    fetchTests();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Render loading state
  if (loading && tests.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchTests}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Test Reports
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and analyze test results and performance metrics
        </Typography>
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tests
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalTests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Tests
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {stats.activeTests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Upcoming Tests
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {stats.upcomingTests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Tests
              </Typography>
              <Typography variant="h4" component="div" color="text.secondary">
                {stats.completedTests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300, maxWidth: '100%' }}
        />
        
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
              label="Status"
            >
              <MenuItem value="all">All Tests</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh">
            <IconButton onClick={fetchTests}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Tests Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No tests match your search criteria' 
                        : 'No tests available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((test) => {
                    const status = getTestStatus(test.startTime, test.endTime);
                    
                    return (
                      <TableRow hover key={test.testId}>
                        <TableCell>
                          <Typography variant="subtitle2">{test.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary" noWrap>
                            {test.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(test.startTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(test.endTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={status.label}
                            color={status.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Report">
                            <IconButton
                              onClick={() => navigate(`/admin/tests/${test.testId}/report`)}
                              color="primary"
                              size="small"
                            >
                              <BarChartIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => {}}
                              color="default"
                              size="small"
                              sx={{ ml: 1 }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default TestListPage;
