import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
    PushNotifications,
    Token,
    PushNotificationSchema,
    ActionPerformed,
} from '@capacitor/push-notifications';

const PushNotificationsHandler = () => {

    useEffect(() => {
        const registerAndListen = async () => {

            if (!Capacitor.isNativePlatform()) {
                console.log("Las notificaciones push no están disponibles en la web.");
                return;
            }


            try {
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {

                    console.warn('El permiso para notificaciones push no fue concedido.');
                    return;
                }

                await PushNotifications.register();

                PushNotifications.addListener('registration', (token: Token) => {
                    console.info('Dispositivo registrado para notificaciones. TOKEN:', token.value);
    
                });

                PushNotifications.addListener('registrationError', (err: any) => {
                    console.error('Error en el registro de notificaciones:', err);
                });

                PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                    console.log('Notificación push recibida en primer plano:', notification);

                });

                PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                    console.log('Acción de notificación realizada:', notification);
                    const data = notification.notification.data;
                    if (data.detailsId) {
                        console.log(`Redirigiendo a la página de detalles: ${data.detailsId}`);
                    }
                });
            } catch (error) {
                console.error("Error al registrarse para las notificaciones push", error);
            }
        }

        registerAndListen();

        return () => {
            if (Capacitor.isNativePlatform()) {
                PushNotifications.removeAllListeners();
            }
        };

    }, []);

    return null;
};

export default PushNotificationsHandler;
