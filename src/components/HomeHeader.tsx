import { TouchableOpacity } from "react-native";
import { VStack, HStack, Heading, Text, Icon } from "native-base"; //Hstack, alinha horizontal, Vstack vertical.
import { MaterialIcons } from '@expo/vector-icons'

import { api } from "@services/api";
import { useAuth } from "@hooks/useAuth";

import defaultUserPhoto from '@assets/userPhotoDefault.png'

import { UserPhoto } from "./UserPhoto";

export function HomeHeader() {
    const { user, signOut } = useAuth();

    return (
        <HStack bg='gray.600' alignItems="center" pb={5} pt={16} px={8} >
            <UserPhoto
                source={
                    user.avatar
                        ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                        : defaultUserPhoto}
                size={16}
                alt="Foto do usuario"
                mr={4}
            />
            <VStack flex={1} >
                <Text color="gray.100" fontSize="md" >
                    Olá,
                </Text>

                <Heading color="gray.100" fontSize="md" fontFamily={'heading'}>
                    {user.name}
                </Heading>
            </VStack>

            <TouchableOpacity onPress={signOut} >
                <Icon
                    as={MaterialIcons}
                    name="logout"
                    color='gray.200'
                    size={6}
                />
            </TouchableOpacity>
        </HStack>
    );
}


