import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

import { useAuth } from '@hooks/useAuth'

import { AuthNavigatorRoutesProps } from "@routes/auth.routes";

import LogoSvg from '@assets/logo.svg'
import BackgroundImg from "@assets/background.png"

import { AppError } from "@utils/AppError";

import { Input } from "@components/Input";
import { Button } from "@components/Button";


type FormDataProps = {
    email: string;
    password: string;
}

const signInSchema = yup.object({
    email: yup.string().required('Informe o e-mail.').email('E-mail inválido.',),
    password: yup.string().required('Informe a senha.').min(6, 'A senha deve conter pelo menos 6 dígitos.')
});


export function SignIn() {
    const [isLoading, setIsLoading] = useState(false)
    const { signIn } = useAuth();
    const navigation = useNavigation<AuthNavigatorRoutesProps>(); 
    const toast = useToast();


    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema)
    });


    function handleNewAccount() {
        navigation.navigate('signUp');
    }

    async function handleSignIn({ email, password }: FormDataProps) {
        try {
            setIsLoading(true)
            await signIn(email, password);
            toast.show({
                title: 'Logado',
                placement: 'top',
                bgColor: 'green.500',
                duration: 1800,
            })


        } catch (error) {
            const isAppError = error instanceof AppError;

            const title = isAppError ? error.message : 'Não foi possivel entrar. Tente novamente mais tarde.';
            setIsLoading(false)

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500',
                duration: 1500,
            });
        }
    }

    return (
        <ScrollView _contentContainerStyle={{ flexGrow: 1 }} showsHorizontalScrollIndicator={false} >
            <VStack flex={1} px={10} pb={16} >
                <Image
                    source={BackgroundImg}
                    defaultSource={BackgroundImg}
                    alt="Pessoas treinando"
                    resizeMode="contain"
                    position={'absolute'}
                />

                <Center my={24}>
                    <LogoSvg />

                    <Text color='gray.100' fontSize='sm' >
                        Treine sua mente e o seu corpo
                    </Text>

                </Center >

                <Center>
                    <Heading color='gray.100' fontSize='xl' mb={6} fontFamily='heading' >
                        Acesse sua conta
                    </Heading>

                    <Controller
                        control={control}
                        name="email"
                        rules={{ required: 'Informe o e-mail' }}
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder="E-mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={onChange}
                                errorMessage={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        rules={{ required: 'Informe a senha' }}
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder="Senha"
                                onChangeText={onChange}
                                secureTextEntry
                                errorMessage={errors.password?.message}
                                returnKeyType="send"
                            />
                        )}
                    />

                    <Button
                        mt={2}
                        title="Acessar"
                        isLoading={isLoading}
                        onPress={handleSubmit(handleSignIn)}
                    />

                </Center>

                <Center mt={32} >

                    <Text
                        color='gray.100'
                        fontSize='sm'
                        mb={3}
                        fontFamily='body'
                    >
                        Ainda não tem acesso?
                    </Text>

                    <Button
                        title="Criar conta"
                        variant='outline'
                        onPress={handleNewAccount}
                    />
                </Center>
            </VStack>
        </ScrollView>
    );
}


