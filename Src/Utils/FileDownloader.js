import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-simple-toast';
import {PermissionsAndroid, Platform} from 'react-native';
import Share from 'react-native-share';

const isPermitted = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'External Storage Write Permission',
          message: 'App needs access to Storage data',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  } else {
    return true;
  }
};
function extensionFinder(ext) {
  switch (ext) {
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'pdf':
      return 'application/pdf';
    case 'jpeg':
      return 'image/jpeg';
    case 'jpg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'tif':
      return 'image/tif';
    case 'svg':
      return 'image/svg+xml';
    case 'raw':
      return 'image/x-raw';
    case 'ico':
      return 'image/x-ico';
    case 'heif':
      return 'image/heif';
    case 'heic':
      return 'image/heic';
    case 'avif':
      return 'image/avif';
    default:
      return 'image/jpg';
  }
}
export default async function FileDownloader(file, cb) {
  const {config, fs} = RNFetchBlob;
  const attachmentToDownload = file.attachment;
  const splitName = attachmentToDownload.split('/');
  const fileName = splitName[splitName.length - 1];
  if (Platform.OS == 'android') {
    if (await isPermitted()) {
      let PictureDir = fs.dirs.PictureDir;
      let options = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: false,
          path: PictureDir + '/' + fileName,
          description: 'Downloading image.',
        },
        overwrite: true,
      };
      await config(options)
        .fetch('GET', attachmentToDownload)
        .then(res => {
          console.log('success getting file', res, res.path());
          Toast.show(
            `File Saved At In Pictures Directory by the name of ${fileName}`,
            Toast.LONG,
          );
        })
        .catch(err => {
          Toast.show('File Was Not Downloaded Due To Error', Toast.LONG);
          console.log('eerror downloading file', err);
        })
        .finally(function () {
          cb();
        });
    } else {
      cb();
      Toast.show('Please Grant Permission For Downloading', Toast.LONG);
    }
  } else {
    let PictureDir = fs.dirs.DocumentDir;
    const name = PictureDir + '/Attachment' + fileName;
    let options = {
      fileCache: true,
      path: name,
    };
    await config(options)
      .fetch('GET', file.attachment)
      .then(res => {
        console.log('success getting file', res.path());
        saveToLocal(res.path(), fileName);
      })
      .catch(err => {
        Toast.show('File Was Not Downloaded Due To Error', Toast.LONG);
        console.log('eerror downloading file', err);
        cb();
      });
  }
  async function saveToLocal(prevFile, extension) {
    const ext = extension.split('.');
    let options = {
      type: extensionFinder(ext[ext.length - 1]),
      url: prevFile,
      saveToFiles: true,
    };
    await Share.open(options)
      .then(resp => {
        Toast.show('File Was Downloaded Successfully', Toast.LONG);
      })
      .catch(err => console.log(err))
      .finally(function () {
        cb();
      });
  }
  return null;
}
