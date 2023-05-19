import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Box, HStack, Heading, Icon, Image, Text, VStack, ScrollView, useToast } from "native-base";
import { Feather } from '@expo/vector-icons'
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppError } from "@utils/AppError";
import { api } from "@services/api";

import { ExerciseDTO } from "@dtos/ExerciseDTO";

import { AppNavigatorRoutesProps } from "@routes/app.routes";

import BodySvg from '@assets/body.svg'
import SeriesSvg from '@assets/series.svg'
import RepetitionSvg from '@assets/repetitions.svg'

import { Button } from "@components/Button";
import { Loading } from "@components/Loading";

type RouteParamsProps = {
    exerciseId: string;
}

export function Exercise() {
    const [isLoading, setIsLoading] = useState(true);
    const [sendingRegister, setSendingRegister] = useState(false);
    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);

    const navigation = useNavigation<AppNavigatorRoutesProps>();
    const route = useRoute();
    const toast = useToast();
    

    const { exerciseId } = route.params as RouteParamsProps;

    function handleGoBack() {
        navigation.navigate('home');
    }

    async function handleExerciseHistoryRegister() {
        try {
            setSendingRegister(true);

            await api.post('/history', { exercise_id: exerciseId });

           
            

            toast.show({
                title: 'Parabéns! Exercício registrado no seu histórico.',
                placement: "top",
                bgColor: 'green.700',
            });


        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível registrar o exercício.';

            toast.show({
                title,
                placement: "top",
                bgColor: 'red.500',
            });

        } finally {
            setSendingRegister(false);
        }
    }

    async function fetchExerciseDetails() {
        try {
            setIsLoading(true);

            const response = await api.get(`/exercises/${exerciseId}`);

            setExercise(response.data);


        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício.';

            toast.show({
                title,
                placement: "top",
                bgColor: 'red.500',
            });
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchExerciseDetails();
    }, [exerciseId]);


    return (
        <VStack flex={1} >
            <VStack px={8} bg={'gray.600'} pt={12} >
                <TouchableOpacity onPress={handleGoBack} >
                    <Icon
                        as={Feather}
                        name="arrow-left"
                        color={'green.500'}
                        size={6}
                    />
                </TouchableOpacity>

                <HStack justifyContent={'space-between'} mt={4} mb={8} alignItems={'center'} >
                    <Heading color={'gray.100'} fontSize={'lg'} flexShrink={1} fontFamily={'heading'}>
                        {exercise.name}
                    </Heading>

                    <HStack alignItems={'center'}>
                        <BodySvg />

                        <Text color={'gray.200'} ml={1} textTransform={'capitalize'} >
                            {exercise.group}
                        </Text>
                    </HStack>

                </HStack>
            </VStack>

            {isLoading ? <Loading /> :
                <ScrollView>
                    <VStack p={8} >
                        <Box mb={3} rounded='lg' overflow={'hidden'}>
                            <Image
                                w={'full'}
                                h={80}
                                source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                                alt={`Treinando ${exercise.group}`}
                                resizeMode="cover" 
                                rounded={'lg'}
                                opacity={0.8} 

                            />
                        </Box>
                        <Box bg={'gray.600'} rounded={'md'} pb={4} px={4} >
                            <HStack justifyContent={'space-around'} alignItems={'center'} mb={6} mt={5} >
                                <HStack>
                                    <SeriesSvg />
                                    <Text color={'gray.200'} ml={2} >
                                        {exercise.series} séries
                                    </Text>
                                </HStack>

                                <HStack>
                                    <RepetitionSvg />
                                    <Text color={'gray.200'} ml={2} >
                                        {exercise.repetitions} repetições
                                    </Text>
                                </HStack>
                            </HStack>
                            <Button
                                title="Marcar como realizado"
                                onPress={handleExerciseHistoryRegister}
                                isLoading={sendingRegister}
                            />
                        </Box>
                    </VStack>
                </ScrollView>
            }
        </VStack>
    );
}

