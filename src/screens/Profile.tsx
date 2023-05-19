import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base";

import { api } from "@services/api";
import { AppError } from "@utils/AppError";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAuth } from "@hooks/useAuth";

import defaultUserPhoto from '@assets/userPhotoDefault.png'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as yup from 'yup';

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { UserPhoto } from "@components/UserPhoto";
import { ScreenHeader } from "@components/ScreenHeader";


const PHOTO_SIZE = 33;

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    old_password: string;
    confirm_password: string;
}

const profileSchema = yup.object({
    name: yup.string()
        .required('Informe o nome.'),
    password: yup.string()
        .min(6, 'A senha deve conter pelo menos 6 dígitos.')
        .nullable()
        .transform((value) => !!value ? value : null),
    confirm_password: yup
        .string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('password')], 'A confirmação de senha não confere.')
        .when('password', {
            is: (Field: any) => Field, //valida o password, mesma coisa de Field !== null, pra não enviar vazio.
            then: (schema) => schema.nullable()
                .required('Informe a confirmação da senha.')
                .transform((value) => !!value ? value : null)
        })
})

export function Profile() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [photoIsLoading, setPhotoIsLoading] = useState(false);

    const toast = useToast();
    const { user, updateUserProfile } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email,

        },
        resolver: yupResolver(profileSchema),
    });

    async function handleUserPhotoSelect() {
        setPhotoIsLoading(true)
        try {
            const phtotoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                aspect: [4, 4],
                allowsEditing: true,
            });

            if (phtotoSelected.canceled) {
                return;
            }

            if (phtotoSelected.assets[0].uri) {
                const photoInfo = await FileSystem.getInfoAsync(phtotoSelected.assets[0].uri, { size: true })

                if (photoInfo.exists && (photoInfo.size / 1024 / 1024) > 5) {

                    return toast.show({
                        title: 'Essa imagem é muito grande. Escolha uma de até 5MB.',
                        placement: 'top',
                        bgColor: 'red.500',
                        duration: 2500,
                        mt: 8,
                    });

                }
                const fileExtension = phtotoSelected.assets[0].uri.split('.').pop();

                const photoFile = {
                    name: `${user.name}.${fileExtension}`.toLowerCase(),
                    uri: phtotoSelected.assets[0].uri,
                    type: `${phtotoSelected.assets[0].type}/${fileExtension}`
                } as any;

                const userPhotoUploadForm = new FormData();
                userPhotoUploadForm.append('avatar', photoFile);

                const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });


                const userUpdated = user;
                userUpdated.avatar = avatarUpdatedResponse.data.avatar;

                updateUserProfile(userUpdated);

                toast.show({
                    title: 'Foto atualizada!',
                    placement: 'top',
                    bgColor: 'green.500'
                })

            }


        } catch (error) {
            console.log(error)
        } finally {
            setPhotoIsLoading(false)
        }
    }

    async function handleProfileUpdate(data: FormDataProps) {//dados do input.
        try {
            setIsUpdating(true);

            const userUpdated = user;
            userUpdated.name = data.name;

            await api.put('/users', data);
            await updateUserProfile(userUpdated)


            toast.show({
                title: 'Perfil atualizado com sucesso',
                placement: 'top',
                bgColor: 'green.500'
            });



        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possivel atualizar os dados. Tente novamente mais tarde.';

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500',
                duration: 1500,
            });

        } finally {
            setIsUpdating(false);
        }

    }

    return (
        <VStack flex={1} >

            <ScreenHeader title="Perfil" />

            <ScrollView contentContainerStyle={{ paddingBottom: 36 }} >
                <Center mt={6} px={10} >
                    <Skeleton
                        w={PHOTO_SIZE}
                        h={PHOTO_SIZE}
                        rounded={'full'}
                        startColor='gray.600'
                        endColor='gray.400'
                        isLoaded={!photoIsLoading}
                    >

                        <UserPhoto
                            source={
                                user.avatar
                                    ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                                    : defaultUserPhoto}
                            alt="Foto do usuário"
                            size={33}
                        />

                    </Skeleton>

                    <TouchableOpacity onPress={handleUserPhotoSelect} >
                        <Text color={'green.500'} fontWeight={'bold'} fontSize={'md'} mt={2} mb={8} >
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                bg={'gray.600'}
                                placeholder="Nome"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange } }) => (
                            <Input
                                bg={'gray.600'}
                                placeholder="usuario@email.com"
                                isDisabled
                                onChangeText={onChange}

                            />
                        )}
                    />


                    <Heading color={'gray.200'} fontSize={'md'} mb={2} mt={8} alignSelf={'flex-start'} fontFamily={'heading'}>
                        Alterar senha
                    </Heading>

                    <Controller
                        control={control}
                        name="old_password"
                        render={({ field: { onChange } }) => (
                            <Input
                                bg={'gray.600'}
                                placeholder="Senha antiga"
                                secureTextEntry
                                onChangeText={onChange}


                            />
                        )}
                    />


                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange } }) => (
                            <Input
                                bg={'gray.600'}
                                placeholder="Nova senha"
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.password?.message}

                            />
                        )}
                    />


                    <Controller
                        control={control}
                        name="confirm_password"
                        render={({ field: { onChange } }) => (
                            <Input
                                bg={'gray.600'}
                                placeholder="Confirme a nova senha"
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.confirm_password?.message}

                            />
                        )}
                    />

                    <Button
                        title="Atualizar"
                        mt={4}
                        onPress={handleSubmit(handleProfileUpdate)}
                        isLoading={isUpdating}
                    />
                </Center>


            </ScrollView>
        </VStack>
    );
}
