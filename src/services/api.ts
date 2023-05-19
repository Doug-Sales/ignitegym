import axios, { AxiosInstance, AxiosError } from "axios";

import { AppError } from "@utils/AppError";

import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";

type SignOut = () => void;

type PromiseType = {
    onSucces: (token: string) => void;
    onFailure: (error: AxiosError) => void;
}

type APIInstanceProps = AxiosInstance & {
    registerIntercepTokenManager: (signOut: SignOut) => () => void;
};


const api = axios.create({
    baseURL: 'http://192.168.15.7:3333'
}) as APIInstanceProps;


let failQueue: Array<PromiseType> = [];
let isRefreshing: boolean = false;

api.registerIntercepTokenManager = signOut => {
    const interceptTokenManager = api.interceptors.response.use(response => response, async requestError => {

        if (requestError?.response?.status === 401) {
            if (requestError.response.data?.message === 'token.expired' || requestError.response.data?.message === 'token.invalid') {
                const { refresh_token } = await storageAuthTokenGet();

                if (!refresh_token) {
                    signOut();
                    return Promise.reject(requestError);
                }

                const originalRequestConfig = requestError.config;

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failQueue.push({
                            onSucces: (token: string) => {
                                originalRequestConfig.headers = { 'Authorization': `Bearer ${token}` };
                                resolve(api(originalRequestConfig));
                            },
                            onFailure: (error: AxiosError) => {
                                reject(error);
                            },
                        })
                    });
                }

                isRefreshing = true;

                return new Promise(async (resolve, reject) => {
                    try {
                        const { data } = await api.post('/sessions/refresh-token', { refresh_token });
                        await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token });

                        if (originalRequestConfig.data) {
                            originalRequestConfig.data = JSON.parse(originalRequestConfig.data)
                        }

                        originalRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` };


                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

                        failQueue.forEach(request => {
                            request.onSucces(data.token);
                        });

                        console.log('Token atualizado!!!!');

                        resolve(api(originalRequestConfig));


                    } catch (error: any) {
                        failQueue.forEach(request => {
                            request.onFailure(error);
                        });

                        signOut();
                        reject(error);
                    } finally {
                        isRefreshing = false;
                        failQueue = [];

                    }
                })
            }

            signOut();
        }

        if (requestError.response && requestError.response.data) {
            return Promise.reject(new AppError(requestError.response.data.message));
        } else {
            return Promise.reject(requestError);
        }
    });

    return () => {
        api.interceptors.response.eject(interceptTokenManager);
    };
};


export { api };
