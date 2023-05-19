import { Image, IImageProps } from "native-base";
import defaultUserPhoto from '@assets/userPhotoDefault.png'


type Props = IImageProps & {
    size: number;

}



export function UserPhoto({ size, ...rest }: Props) {
    return (
        <Image
            w={size}
            h={size}
            rounded='full'
            borderWidth={2}
            borderColor='gray.400'
            source={defaultUserPhoto}
            {...rest}
        />
    );
}


