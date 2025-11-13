import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from 'agora-rtc-sdk-ng';
import { supabase } from '@/integrations/supabase/client';

export class LiveStreamService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private appId: string = '';
  private channelName: string = '';
  private token: string = '';
  private uid: number = 0;

  constructor() {
    // Enable Agora logging
    AgoraRTC.setLogLevel(4);
  }

  /**
   * Initialize Agora client and get token from backend
   */
  async initialize(role: 'publisher' | 'subscriber', channelName: string) {
    try {
      // Ensure we have a valid session and forward the JWT explicitly (some environments don't auto-attach it)
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        throw new Error('Veuillez vous connecter pour démarrer un live');
      }

      // Get Agora token from backend (pass Authorization header explicitly)
      const { data, error } = await supabase.functions.invoke('generate-agora-token', {
        body: {
          channelName,
          role,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      this.appId = data.appId;
      this.channelName = data.channelName;
      this.token = data.token;
      this.uid = data.uid;

      console.log('Agora config received:', {
        appId: this.appId,
        channelName: this.channelName,
        uid: this.uid,
        hasToken: !!this.token
      });

      // Create Agora client
      this.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

      // Set client role
      if (role === 'publisher') {
        await this.client.setClientRole('host');
      } else {
        await this.client.setClientRole('audience');
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to initialize LiveStreamService:', error);
      throw error;
    }
  }

  /**
   * Join a live stream channel
   */
  async joinChannel() {
    if (!this.client) throw new Error('Client not initialized');

    try {
      await this.client.join(this.appId, this.channelName, this.token, this.uid);
      console.log('Joined channel successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  /**
   * Start broadcasting (for publishers)
   */
  async startBroadcast() {
    if (!this.client) throw new Error('Client not initialized');

    try {
      // Create local audio and video tracks
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrateMin: 1000,
          bitrateMax: 3000,
        },
      });

      // Publish tracks
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      console.log('Broadcasting started');

      return {
        audioTrack: this.localAudioTrack,
        videoTrack: this.localVideoTrack,
      };
    } catch (error) {
      console.error('Failed to start broadcast:', error);
      throw error;
    }
  }

  /**
   * Stop broadcasting
   */
  async stopBroadcast() {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
      }
      if (this.client) {
        await this.client.unpublish();
      }
      console.log('Broadcasting stopped');
    } catch (error) {
      console.error('Failed to stop broadcast:', error);
      throw error;
    }
  }

  /**
   * Leave channel
   */
  async leaveChannel() {
    try {
      await this.stopBroadcast();
      if (this.client) {
        await this.client.leave();
      }
      console.log('Left channel');
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }

  /**
   * Subscribe to remote user (for viewers)
   */
  async subscribeToRemoteUser(
    user: any,
    mediaType: 'video' | 'audio'
  ): Promise<IRemoteVideoTrack | IRemoteAudioTrack | null> {
    if (!this.client) throw new Error('Client not initialized');

    try {
      await this.client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        return user.videoTrack;
      } else {
        return user.audioTrack;
      }
    } catch (error) {
      console.error('Failed to subscribe to remote user:', error);
      return null;
    }
  }

  /**
   * Get client instance
   */
  getClient() {
    return this.client;
  }

  /**
   * Toggle microphone
   */
  async toggleMicrophone(enabled: boolean) {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(enabled);
    }
  }

  /**
   * Toggle camera
   */
  async toggleCamera(enabled: boolean) {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled);
    }
  }

  /**
   * Get available cameras
   */
  async getCameras() {
    return await AgoraRTC.getCameras();
  }

  /**
   * Switch camera by device ID
   */
  async switchCamera(deviceId: string) {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setDevice(deviceId);
    }
  }
}
