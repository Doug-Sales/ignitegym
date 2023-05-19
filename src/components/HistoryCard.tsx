import { HStack, Heading, Text, VStack } from "native-base";
import { HistoryDTO } from "@dtos/HistoryDTO";

type Props = {
    data: HistoryDTO;
}

function convertLocalTime(dataGMT: Date) {
    let dataLocal = new Date();
    let offset = dataLocal.getTimezoneOffset();
    let offsetMilissegundos = offset * 60 * 1000;
    let dataGMTComOffset = dataGMT.getTime() - offsetMilissegundos;
    let dataLocalConvertida = new Date(dataGMTComOffset);
    let horaLocal = dataLocalConvertida.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return horaLocal;
}

export function HistoryCard({ data }: Props) {
    const dateFormat = String(data.created_at).replace(' ', 'T');
    const dateFinal = convertLocalTime(new Date(dateFormat));

    return (
        <HStack
            bg={'gray.600'}
            w={'full'}
            px={5}
            py={4}
            mb={3}
            rounded={'md'}
            alignItems={'center'}
            justifyContent={'space-between'}
        >

            <VStack mr={5} flex={1} >
                <Heading color={'white'} fontSize={'md'} textTransform={'capitalize'} numberOfLines={1} fontFamily={'heading'}>
                    {data.group}
                </Heading>

                <Text color={'gray.100'} fontSize={'lg'} numberOfLines={1}>
                    {data.name}
                </Text>
            </VStack>

            <Text color={'gray.300'} fontSize={'md'}>
                {dateFinal}
            </Text>

        </HStack>
    );
}

