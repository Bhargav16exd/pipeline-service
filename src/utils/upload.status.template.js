export const PENDING = "PENDING"
export const INPROGRESS = "INPROGRESS"
export const DONE = "DONE"


// Factory function to create a fresh status object
export const createVideoStatus = (id,authorizationInitiated,permissionGranted,queue,downloading,uploading) => {
  return {
    id,
    authorizationInitiated: {
      status: authorizationInitiated
    },
    permissionGranted: {
      status: permissionGranted
    },
    queue: {
      status: queue
    },
    downloading: {
      status: downloading
    },
    uploading: {
      status: uploading
    }
  };
};

