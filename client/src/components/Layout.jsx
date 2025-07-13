import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  useColorMode,
  useColorModeValue,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  HStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  VStack,
  Badge,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { BellDot, BellOff, Home, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Layout = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'transparent');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const isLight = colorMode === 'light';
  // Fetch notifications when user is logged in
  useEffect(() => {
    if (user) {
      fetchNotificationCount();
    }
  }, [user]);

  // Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get('/api/notifications/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Fetch notifications when popover opens
  const fetchNotifications = async () => {
    if (!user || notifications.length > 0) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notifications as read
  const markAsRead = async () => {
    if (!user || unreadCount === 0) return;
    
    try {
      await axios.put('/api/notifications/read-all');
      setUnreadCount(0);
      
      // Update read status locally
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    if (notification.type === 'follow') {
      navigate(`/profile/${notification.sender._id}`);
    } else if (notification.type === 'like' || notification.type === 'comment') {
      // Navigate to the post
      // This would require a new API endpoint to get a single post
      // For now, we'll just navigate to the profile of the sender
      navigate(`/profile/${notification.sender._id}`);
    }
    
    setNotificationsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Box minH="100vh">
      <Box
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
        backdropFilter="blur(8px)"
        backgroundColor={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 1)')}
      >
        <Container maxW="container.md">
          <Flex h={16} alignItems="center" justifyContent="space-between">
           <HStack spacing={2}
  cursor="pointer"
  onClick={() => navigate('/')}
>
  <Home size={25} />
  <Heading
    size="lg"
    fontFamily="'Pacifico', cursive"
    bgGradient="linear(to-r, brand.400, brand.600)"
    bgClip="text"
    fontWeight="bold"
  >
    Snappin
  </Heading>
</HStack>
            {user && (
              <HStack spacing={4}>
                <Popover
                  isOpen={notificationsOpen}
                  onOpen={() => {
                    setNotificationsOpen(true);
                    fetchNotifications();
                  }}
                  onClose={() => setNotificationsOpen(false)}
                  placement="bottom-end"
                >
                  <PopoverTrigger>
                    <Box position="relative">
                      <IconButton
                        aria-label="Toggle Notification icon"
                        icon={notificationsOn ? <BellDot size={18} /> : <BellOff size={18} /> }
                        variant="ghost"
                        onClick={() => setNotificationsOn(!notificationsOn)}
                      />
                      {unreadCount > 0 && (
                        <Badge
                          colorScheme="red"
                          borderRadius="full"
                          position="absolute"
                          top="-1"
                          right="-1"
                          fontSize="xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent width="320px" maxH="400px" overflowY="auto">
                    <PopoverHeader fontWeight="semibold" display="flex" justifyContent="space-between" alignItems="center">
                      Notifications
                      {unreadCount > 0 && (
                        <Button size="xs" onClick={markAsRead}>
                          Mark all as read
                        </Button>
                      )}
                    </PopoverHeader>
                    <PopoverBody p={0}>
                      {isLoading ? (
                        <Flex justify="center" align="center" py={4}>
                          <Spinner />
                        </Flex>
                      ) : notifications.length === 0 ? (
                        <Box p={4} textAlign="center">
                          <Text>No notifications yet</Text>
                        </Box>
                      ) : (
                        <VStack spacing={0} align="stretch">
                          {notifications.map(notification => (
                            <Box
                              key={notification._id}
                              p={3}
                              borderBottomWidth="1px"
                              borderColor={borderColor}
                              _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                              cursor="pointer"
                              onClick={() => handleNotificationClick(notification)}
                              bg={!notification.read ? useColorModeValue('gray.50', 'gray.700') : 'transparent'}
                            >
                              <HStack>
                                <Avatar size="sm" src={notification.sender?.avatarUrl} name={notification.sender?.fullName} />
                                <Box>
                                  <Text fontSize="sm">
                                    <Text as="span" fontWeight="bold">
                                      {notification.sender?.fullName}
                                    </Text>{' '}
                                    {notification.type === 'follow' && 'started following you'}
                                    {notification.type === 'like' && 'liked your post'}
                                    {notification.type === 'comment' && 'commented on your post'}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </Text>
                                </Box>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </PopoverBody>
                  </PopoverContent>
                </Popover>

                <IconButton
                  aria-label="Toggle color mode"
                  icon={isLight ? <Moon size={20}/> : <Sun size={20}/>}
                  onClick={toggleColorMode}
                  variant="ghost"
                />

                <Menu>
  <MenuButton>
    <Box position="relative">
      <Avatar size="sm" name={user.fullName} src={user.avatarUrl} />
      {user.isOnline && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          boxSize="10px"
          bg="green.400"
          border="2px solid white"
          borderRadius="full"
        />
      )}
    </Box>
  </MenuButton>
  <MenuList>
    <MenuItem onClick={() => navigate(`/profile/${user.id}`)}>
      <Text>Profile</Text>
    </MenuItem>
    <MenuDivider />
    <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
  </MenuList>
</Menu>

              </HStack>
            )}

            {!user && (
              <HStack spacing={4}>
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === 'light' ? <Moon /> : <Sun />}
                  onClick={toggleColorMode}
                  variant="ghost"
                />
                <Button variant="solid" colorScheme="brand" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </HStack>
            )}
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.md" py={6}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 