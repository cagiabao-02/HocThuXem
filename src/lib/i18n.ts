export type Lang = 'vi' | 'en';

export type TranslationKey = keyof typeof translations.vi;

const translations = {
  vi: {
    // Auth
    'auth.login': 'Đăng nhập',
    'auth.signup': 'Đăng ký',
    'auth.logout': 'Đăng xuất',
    'auth.username': 'Tên đăng nhập',
    'auth.password': 'Mật khẩu',
    'auth.email': 'Email',
    'auth.display_name': 'Tên hiển thị',
    'auth.no_account': 'Chưa có tài khoản?',
    'auth.has_account': 'Đã có tài khoản?',
    'auth.welcome': 'Chào mừng bạn đến với',
    'auth.subtitle': 'Nền tảng học tập thông minh với AI',
    'auth.login_success': 'Đăng nhập thành công!',
    'auth.signup_success': 'Đăng ký thành công! Vui lòng kiểm tra email.',

    // Navigation
    'nav.dashboard': 'Trang chủ',
    'nav.documents': 'Tài liệu',
    'nav.lessons': 'Bài học',
    'nav.leaderboard': 'Xếp hạng',
    'nav.profile': 'Hồ sơ',

    // Dashboard
    'dashboard.title': 'Trang chủ',
    'dashboard.welcome': 'Chào',
    'dashboard.xp': 'Điểm XP',
    'dashboard.level': 'Cấp độ',
    'dashboard.streak': 'Chuỗi ngày',
    'dashboard.documents': 'Tài liệu',
    'dashboard.lessons_completed': 'Bài đã hoàn thành',
    'dashboard.recent': 'Hoạt động gần đây',
    'dashboard.quick_actions': 'Hành động nhanh',
    'dashboard.upload_doc': 'Tải tài liệu',
    'dashboard.create_lesson': 'Tạo bài học',
    'dashboard.day': 'ngày',
    'dashboard.days': 'ngày',
    'dashboard.no_activity': 'Chưa có hoạt động nào',
    'dashboard.start_learning': 'Hãy bắt đầu học ngay!',

    // Documents
    'documents.title': 'Quản lý tài liệu',
    'documents.upload': 'Tải lên tài liệu',
    'documents.upload_desc': 'Kéo thả hoặc click để chọn file',
    'documents.supported': 'Hỗ trợ: PDF, TXT, DOCX',
    'documents.processing': 'Đang xử lý...',
    'documents.ready': 'Sẵn sàng',
    'documents.error': 'Lỗi',
    'documents.pending': 'Đang chờ',
    'documents.delete': 'Xóa',
    'documents.create_lesson': 'Tạo bài học',
    'documents.empty': 'Chưa có tài liệu nào',
    'documents.empty_desc': 'Hãy tải lên tài liệu đầu tiên của bạn',

    // Lessons
    'lessons.title': 'Bài học của bạn',
    'lessons.flashcard': 'Flash Card',
    'lessons.quiz': 'Trắc nghiệm',
    'lessons.essay': 'Tự luận',
    'lessons.all': 'Tất cả',
    'lessons.start': 'Bắt đầu học',
    'lessons.continue': 'Tiếp tục',
    'lessons.difficulty': 'Độ khó',
    'lessons.questions': 'câu hỏi',
    'lessons.cards': 'thẻ',
    'lessons.empty': 'Chưa có bài học nào',
    'lessons.empty_desc': 'Tạo bài học từ tài liệu của bạn',
    'lessons.generate': 'Tạo bài học',
    'lessons.generating': 'AI đang tạo bài học...',
    'lessons.select_type': 'Chọn loại bài học',
    'lessons.select_doc': 'Chọn tài liệu',
    'lessons.count': 'Số câu hỏi / thẻ',

    // Flash Card
    'flashcard.flip': 'Lật thẻ',
    'flashcard.known': 'Đã thuộc',
    'flashcard.unknown': 'Cần ôn lại',
    'flashcard.progress': 'Tiến độ',
    'flashcard.complete': 'Hoàn thành!',
    'flashcard.complete_desc': 'Bạn đã ôn hết tất cả thẻ',
    'flashcard.restart': 'Ôn lại',
    'flashcard.back': 'Quay lại',

    // Quiz
    'quiz.question': 'Câu hỏi',
    'quiz.of': 'của',
    'quiz.submit': 'Nộp bài',
    'quiz.next': 'Câu tiếp',
    'quiz.correct': 'Chính xác!',
    'quiz.incorrect': 'Sai rồi!',
    'quiz.explanation': 'Giải thích',
    'quiz.result': 'Kết quả',
    'quiz.score': 'Điểm số',
    'quiz.xp_earned': 'XP nhận được',
    'quiz.retry': 'Làm lại',
    'quiz.back': 'Quay lại',

    // Essay
    'essay.write': 'Viết câu trả lời',
    'essay.submit': 'Nộp bài',
    'essay.grading': 'AI đang chấm điểm...',
    'essay.feedback': 'Nhận xét',
    'essay.score': 'Điểm',
    'essay.next': 'Câu tiếp',
    'essay.complete': 'Hoàn thành!',
    'essay.back': 'Quay lại',

    // Leaderboard
    'leaderboard.title': 'Bảng xếp hạng',
    'leaderboard.rank': 'Hạng',
    'leaderboard.player': 'Người chơi',
    'leaderboard.xp': 'XP',
    'leaderboard.level': 'Cấp',
    'leaderboard.streak': 'Chuỗi',
    'leaderboard.you': '(Bạn)',

    // Profile
    'profile.title': 'Hồ sơ cá nhân',
    'profile.edit': 'Chỉnh sửa',
    'profile.save': 'Lưu',
    'profile.cancel': 'Hủy',
    'profile.stats': 'Thống kê',
    'profile.joined': 'Tham gia từ',
    'profile.language': 'Ngôn ngữ',
    'profile.settings': 'Cài đặt',

    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Có lỗi xảy ra',
    'common.retry': 'Thử lại',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.delete': 'Xóa',
    'common.confirm': 'Xác nhận',
    'common.close': 'Đóng',
    'common.back': 'Quay lại',
    'common.next': 'Tiếp theo',
    'common.search': 'Tìm kiếm...',
  },
  en: {
    // Auth
    'auth.login': 'Log in',
    'auth.signup': 'Sign up',
    'auth.logout': 'Log out',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.email': 'Email',
    'auth.display_name': 'Display Name',
    'auth.no_account': "Don't have an account?",
    'auth.has_account': 'Already have an account?',
    'auth.welcome': 'Welcome to',
    'auth.subtitle': 'AI-powered smart learning platform',
    'auth.login_success': 'Login successful!',
    'auth.signup_success': 'Signup successful! Please check your email.',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.documents': 'Documents',
    'nav.lessons': 'Lessons',
    'nav.leaderboard': 'Leaderboard',
    'nav.profile': 'Profile',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Hello',
    'dashboard.xp': 'XP Points',
    'dashboard.level': 'Level',
    'dashboard.streak': 'Day Streak',
    'dashboard.documents': 'Documents',
    'dashboard.lessons_completed': 'Lessons Completed',
    'dashboard.recent': 'Recent Activity',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.upload_doc': 'Upload Document',
    'dashboard.create_lesson': 'Create Lesson',
    'dashboard.day': 'day',
    'dashboard.days': 'days',
    'dashboard.no_activity': 'No activity yet',
    'dashboard.start_learning': 'Start learning now!',

    // Documents
    'documents.title': 'Documents',
    'documents.upload': 'Upload Document',
    'documents.upload_desc': 'Drag & drop or click to select',
    'documents.supported': 'Supported: PDF, TXT, DOCX',
    'documents.processing': 'Processing...',
    'documents.ready': 'Ready',
    'documents.error': 'Error',
    'documents.pending': 'Pending',
    'documents.delete': 'Delete',
    'documents.create_lesson': 'Create Lesson',
    'documents.empty': 'No documents yet',
    'documents.empty_desc': 'Upload your first document',

    // Lessons
    'lessons.title': 'Your Lessons',
    'lessons.flashcard': 'Flash Card',
    'lessons.quiz': 'Quiz',
    'lessons.essay': 'Essay',
    'lessons.all': 'All',
    'lessons.start': 'Start Learning',
    'lessons.continue': 'Continue',
    'lessons.difficulty': 'Difficulty',
    'lessons.questions': 'questions',
    'lessons.cards': 'cards',
    'lessons.empty': 'No lessons yet',
    'lessons.empty_desc': 'Create a lesson from your documents',
    'lessons.generate': 'Generate Lesson',
    'lessons.generating': 'AI is generating your lesson...',
    'lessons.select_type': 'Select lesson type',
    'lessons.select_doc': 'Select document',
    'lessons.count': 'Number of questions / cards',

    // Flash Card
    'flashcard.flip': 'Flip Card',
    'flashcard.known': 'Known',
    'flashcard.unknown': 'Need Review',
    'flashcard.progress': 'Progress',
    'flashcard.complete': 'Complete!',
    'flashcard.complete_desc': "You've reviewed all cards",
    'flashcard.restart': 'Review Again',
    'flashcard.back': 'Back',

    // Quiz
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'quiz.submit': 'Submit',
    'quiz.next': 'Next',
    'quiz.correct': 'Correct!',
    'quiz.incorrect': 'Incorrect!',
    'quiz.explanation': 'Explanation',
    'quiz.result': 'Result',
    'quiz.score': 'Score',
    'quiz.xp_earned': 'XP Earned',
    'quiz.retry': 'Retry',
    'quiz.back': 'Back',

    // Essay
    'essay.write': 'Write your answer',
    'essay.submit': 'Submit',
    'essay.grading': 'AI is grading...',
    'essay.feedback': 'Feedback',
    'essay.score': 'Score',
    'essay.next': 'Next',
    'essay.complete': 'Complete!',
    'essay.back': 'Back',

    // Leaderboard
    'leaderboard.title': 'Leaderboard',
    'leaderboard.rank': 'Rank',
    'leaderboard.player': 'Player',
    'leaderboard.xp': 'XP',
    'leaderboard.level': 'Level',
    'leaderboard.streak': 'Streak',
    'leaderboard.you': '(You)',

    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.stats': 'Statistics',
    'profile.joined': 'Joined',
    'profile.language': 'Language',
    'profile.settings': 'Settings',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Retry',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.search': 'Search...',
  },
};

export function t(key: string, lang: Lang = 'vi'): string {
  const dict = translations[lang] || translations.vi;
  return (dict as Record<string, string>)[key] || key;
}

export function getAvailableLanguages(): { code: Lang; name: string }[] {
  return [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
  ];
}
