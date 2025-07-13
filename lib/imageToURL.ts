import { storage, ref, uploadBytesResumable, getDownloadURL } from './firebase';
import * as FileSystem from 'expo-file-system';

export const uploadImageToFirebase = async (uri: string, fileName: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    console.log(blob)

    const storageRef = ref(storage, 'images/' + fileName);
    const uploadTaskSnapshot = await uploadBytesResumable(storageRef, blob); // wait for upload to finish

    const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref); // get public URL
    console.log('File available at', downloadURL);

    return downloadURL;
};
