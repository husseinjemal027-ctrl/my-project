import { useState } from 'react';

const translations = {
  en: {
    brand: 'ISM',
    signIn: 'Sign in',
    register: 'Register',
    signOut: 'Sign out',
    library: 'Content library',
    addContent: 'Add content',
    all: 'All',
    quran: 'Quran',
    book: 'Book',
    audio: 'Audio',
    video: 'Video',
    dhikr: 'Dhikr',
    search: 'Search content…',
    noItems: 'No items in this category',
    emptyDescription: 'Try another category or add the first item.',
    title: 'Title',
    body: 'Description',
    category: 'Category',
    fileOrUrl: 'File or URL',
    coverImage: 'Cover image (optional)',
    resourceFile: 'Book, audio, or video file (optional)',
    resourceFileHint: 'Books: PDF or EPUB. Audio: MP3, WAV, M4A, or OGG. Video: MP4, MOV, or WEBM. Maximum 100 MB.',
    save: 'Save content',
    cancel: 'Cancel',
    important: 'Important',
    importantText: 'You can upload an optional cover image (JPG, PNG, WEBP, or GIF; up to 5 MB) and a resource file, or paste a direct link. Uploaded files are stored in MongoDB Atlas.',
    page: 'Page',
    loading: 'Loading…',
    edit: 'Edit',
    delete: 'Delete',
    signedIn: 'Signed in',
  },
  am: {
    brand: 'አይኤስኤም',
    signIn: 'ግባ',
    register: 'ተመዝገብ',
    signOut: 'ውጣ',
    library: 'የይዘት ማዕከል',
    addContent: 'ይዘት ጨምር',
    all: 'ሁሉም',
    quran: 'ቁርአን',
    book: 'መጽሐፍ',
    audio: 'ድምፅ',
    video: 'ቪዲዮ',
    dhikr: 'ዚክር',
    search: 'ይዘት ፈልግ…',
    noItems: 'በዚህ ምድብ ይዘት የለም',
    emptyDescription: 'ሌላ ምድብ ይምረጡ ወይም የመጀመሪያውን ይዘት ያክሉ።',
    title: 'ርዕስ',
    body: 'መግለጫ',
    category: 'ምድብ',
    fileOrUrl: 'ፋይል ወይም URL',
    coverImage: 'የሽፋን ምስል (አማራጭ)',
    resourceFile: 'የመጽሐፍ፣ ድምፅ ወይም ቪዲዮ ፋይል (አማራጭ)',
    resourceFileHint: 'መጽሐፍ፦ PDF ወይም EPUB። ድምፅ፦ MP3፣ WAV፣ M4A ወይም OGG። ቪዲዮ፦ MP4፣ MOV ወይም WEBM። እስከ 100 MB።',
    save: 'ይዘቱን አስቀምጥ',
    cancel: 'ሰርዝ',
    important: 'አስፈላጊ',
    importantText: 'የሽፋን ምስል (JPG፣ PNG፣ WEBP ወይም GIF፤ እስከ 5 MB) እና የሚዲያ ፋይል መስቀል ወይም ቀጥተኛ አገናኝ ማስገባት ይችላሉ።',
    page: 'ገጽ',
    loading: 'በመጫን ላይ…',
    edit: 'አርትዕ',
    delete: 'ሰርዝ',
    signedIn: 'ገብተዋል',
  },
  om: {
    brand: 'ISM',
    signIn: 'Seeni',
    register: 'Galmaa’i',
    signOut: 'Ba’i',
    library: 'Kuusaa qabiyyee',
    addContent: 'Qabiyyee dabali',
    all: 'Hunda',
    quran: 'Qur’aana',
    book: 'Kitaaba',
    audio: 'Sagalee',
    video: 'Viidiyoo',
    dhikr: 'Zikrii',
    search: 'Qabiyyee barbaadi…',
    noItems: 'Gosa kana keessatti qabiyyeen hin jiru',
    emptyDescription: 'Gosa biraa filadhu ykn qabiyyee jalqabaa dabali.',
    title: 'Mata-duree',
    body: 'Ibsa',
    category: 'Gosa',
    fileOrUrl: 'Faayilii ykn URL',
    coverImage: 'Suuraa haguuggaa (filannoo)',
    resourceFile: 'Faayilii kitaabaa, sagalee ykn viidiyoo (filannoo)',
    resourceFileHint: 'Kitaaba: PDF ykn EPUB. Sagalee: MP3, WAV, M4A ykn OGG. Viidiyoo: MP4, MOV ykn WEBM. Hangii 100 MB.',
    save: 'Qabiyyee olkaa’i',
    cancel: 'Dhiisi',
    important: 'Barbaachisaa',
    importantText: 'Suuraa haguuggaa (JPG, PNG, WEBP ykn GIF; hanga 5 MB) fi faayilii miidiyaa olkaa’uu ykn hidhaa kallattii galchuu dandeessa.',
    page: 'Fuula',
    loading: 'Fe’amaa jira…',
    edit: 'Gulaali',
    delete: 'Haqi',
    signedIn: 'Seenteetta',
  },
};

export default function useLanguage() {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = window.localStorage.getItem('ism-language');
      return saved && translations[saved] ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  function changeLanguage(nextLanguage) {
    if (!translations[nextLanguage]) return;
    setLanguage(nextLanguage);
    try {
      window.localStorage.setItem('ism-language', nextLanguage);
    } catch {
      // Language selection still works for this page when storage is unavailable.
    }
  }

  return {
    language,
    setLanguage: changeLanguage,
    t: (key) => translations[language][key] || translations.en[key] || key,
  };
}
