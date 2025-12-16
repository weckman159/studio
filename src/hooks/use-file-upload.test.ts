
import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from './use-file-upload';

// --- Mocks ---

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock the storage functions that the hook uses internally
jest.mock('@/lib/storage', () => ({
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  validateImage: jest.fn(),
}));

import { uploadFile, deleteFile } from '@/lib/storage';

// --- Tests ---

describe('useFileUpload hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useFileUpload());
    expect(result.current.uploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful file upload', async () => {
    const mockFile = new File(['(⌐□_□)'], 'chuck.png', { type: 'image/png' });
    const mockUploadResult = { url: 'https://vercel.blob.com/chuck.png', path: '/chuck.png', fileName: 'chuck.png' };
    
    (uploadFile as jest.Mock).mockResolvedValue(mockUploadResult);

    const { result } = renderHook(() => useFileUpload());

    let uploadPromise: Promise<any>;
    act(() => {
      uploadPromise = result.current.uploadFiles([mockFile], 'avatars', 'user123');
    });

    // Check intermediate state
    expect(result.current.uploading).toBe(true);

    await act(async () => {
      await uploadPromise;
    });

    // Check final state
    expect(uploadFile).toHaveBeenCalledWith(mockFile, 'avatars', 'user123', expect.any(Object));
    expect(result.current.uploading).toBe(false);
    expect(result.current.progress).toBe(100);
    expect(result.current.error).toBeNull();
  });

  it('should handle failed file upload', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const mockError = new Error('Upload failed');
    (uploadFile as jest.Mock).mockRejectedValue(mockError);

    const onError = jest.fn();
    const { result } = renderHook(() => useFileUpload({ onError }));

    await act(async () => {
      await result.current.uploadFiles([mockFile], 'posts', 'post123');
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe('Upload failed');
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should throw an error for too many files', async () => {
    const { result } = renderHook(() => useFileUpload({ maxFiles: 1 }));
    const files = [
      new File([], '1.png', { type: 'image/png' }),
      new File([], '2.png', { type: 'image/png' }),
    ];

    await act(async () => {
      await result.current.uploadFiles(files, 'cars', 'car123');
    });

    expect(result.current.error).toContain('Можно загрузить максимум 1 файлов');
  });

  it('should call deleteFile when removeFile is triggered', async () => {
    const mockUrl = 'https://vercel.blob.com/file-to-delete.png';
    (deleteFile as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.removeFile(mockUrl);
    });

    expect(deleteFile).toHaveBeenCalledWith(mockUrl);
  });

  it('should reset its state', () => {
    const { result } = renderHook(() => useFileUpload());

    act(() => {
        result.current.reset();
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });
});
