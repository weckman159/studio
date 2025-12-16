
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostForm } from './PostForm';
import { Post } from '@/lib/types';

// --- Mocks ---
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const mockUser = {
  uid: 'test-user-123',
  displayName: 'Тестовый Автор',
  photoURL: 'https://example.com/avatar.png',
};

jest.mock('@/firebase', () => ({
  useUser: () => ({ user: mockUser }),
  useFirestore: () => ({}),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock the file upload hook
const mockUploadFiles = jest.fn();
jest.mock('@/hooks/use-file-upload', () => ({
    useFileUpload: () => ({
        uploadFiles: mockUploadFiles,
        uploading: false,
        progress: 0,
    }),
}));

// Mock the GithubEditor component as it's complex and not the focus of this test
jest.mock('@/components/GithubEditor', () => ({
    GithubEditor: ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
        <textarea
            data-testid="mock-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    ),
}));

// --- Tests ---

describe('PostForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ postId: 'new-post-123' }),
    });
    mockUploadFiles.mockResolvedValue([]);
  });

  it('renders in create mode correctly', () => {
    render(<PostForm />);
    expect(screen.getByText('Создать публикацию')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Заголовок поста')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Опубликовать' })).toBeInTheDocument();
  });

  it('renders in edit mode with pre-filled data', () => {
    const postToEdit: Post = {
      id: 'edit-post-123',
      title: 'Тестовый заголовок для редактирования',
      content: 'Тестовый контент.',
      category: 'Блог',
      authorId: mockUser.uid,
      authorName: mockUser.displayName,
      status: 'published',
      likesCount: 0,
      commentsCount: 0,
      views: 0,
      createdAt: new Date(),
    };
    render(<PostForm postToEdit={postToEdit} />);

    expect(screen.getByText('Редактировать')).toBeInTheDocument();
    expect(screen.getByDisplayValue(postToEdit.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(postToEdit.content)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument();
  });

  it('shows an error if title is missing on submit', async () => {
    render(<PostForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Опубликовать' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Введите заголовок',
      });
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
  
  it('submits new post data correctly', async () => {
    render(<PostForm />);

    fireEvent.change(screen.getByPlaceholderText('Заголовок поста'), {
      target: { value: 'Новый супер-пост' },
    });
    fireEvent.change(screen.getByTestId('mock-editor'), {
      target: { value: 'Контент нового поста.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Опубликовать' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Новый супер-пост',
          content: 'Контент нового поста.',
          category: 'Блог', // default category
          coverImage: '',
          authorId: mockUser.uid,
        }),
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Успех!',
        description: 'Пост опубликован.',
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/posts/new-post-123');
    });
  });

   it('handles file upload during submission', async () => {
    const mockFile = new File(['image'], 'cover.jpg', { type: 'image/jpeg' });
    mockUploadFiles.mockResolvedValue([{ url: 'https://example.com/cover.jpg' }]);
    
    render(<PostForm />);

    fireEvent.change(screen.getByPlaceholderText('Заголовок поста'), { target: { value: 'Пост с картинкой' } });
    fireEvent.change(screen.getByTestId('mock-editor'), { target: { value: 'Текст.' } });

    // Simulate file selection
    const coverInput = screen.getByLabelText('Обложка (для ленты)').querySelector('input[type="file"]')!;
    await waitFor(() => {
        fireEvent.change(coverInput, { target: { files: [mockFile] } });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Опубликовать' }));
    
    await waitFor(() => {
        expect(mockUploadFiles).toHaveBeenCalledWith([mockFile], 'posts', expect.any(String));
        expect(mockFetch).toHaveBeenCalledWith('/api/posts', expect.objectContaining({
            body: expect.stringContaining('"coverImage":"https://example.com/cover.jpg"')
        }));
    });
  });
});
