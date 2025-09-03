const IS_DEV = process.env.RUN_ENV === 'development';
const IS_PREVIEW = process.env.RUN_ENV === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.zendev.assistbot.dev';
  }

  if (IS_PREVIEW) {
    return 'com.zendev.assistbot.preview';
  }

  return 'com.zendev.assistbot';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'AssistBot (Dev)';
  }

  if (IS_PREVIEW) {
    return 'AssistBot (Preview)';
  }

  return 'AssistBot: Your AI Assistant';
};

export default {
  name: getAppName(),
  ios: {
    bundleIdentifier: getUniqueIdentifier(),
    plugins: [
      "expo-sqlite"
    ],
  },
  android: {
    package: getUniqueIdentifier(),
  },
  userInterfaceStyle: "automatic"
};
