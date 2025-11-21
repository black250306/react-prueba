import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, PermissionStatus, CameraPermissionState } from '@capacitor/camera';

/**
 * Hook personalizado para gestionar los permisos de la cámara en Capacitor.
 * 
 * @returns {object} - Un objeto que contiene:
 *  - `permissionStatus`: El estado actual del permiso ('prompt', 'granted', 'denied', 'prompt-with-rationale').
 *  - `checkPermission`: Una función para volver a verificar el estado del permiso.
 *  - `requestPermission`: Una función para solicitar el permiso al usuario.
 */
export const useCameraPermission = () => {
    const [permissionStatus, setPermissionStatus] = useState<CameraPermissionState>('prompt');

    // Función para verificar el permiso actual.
    const checkPermission = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) {
            // En la web, el navegador gestiona los permisos. Asumimos 'prompt' y dejamos que el navegador actúe.
            setPermissionStatus('prompt');
            return;
        }

        try {
            const status: PermissionStatus = await Camera.checkPermissions();
            setPermissionStatus(status.camera);
        } catch (error) {
            console.error("Error al verificar el permiso de la cámara", error);
            setPermissionStatus('denied');
        }
    }, []);

    // Función para solicitar el permiso.
    const requestPermission = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) {
            // En web, la solicitud la dispara el intento de usar la cámara.
            // Retornamos 'granted' asumiendo que el navegador pedirá permiso si es necesario.
            // El error se capturará en el bloque try/catch de Html5Qrcode.
            return 'granted';
        }
        
        if (permissionStatus === 'granted') {
            return 'granted';
        }

        try {
            const status: PermissionStatus = await Camera.requestPermissions();
            setPermissionStatus(status.camera);
            return status.camera;
        } catch (error) {
            console.error("Error al solicitar el permiso de la cámara", error);
            setPermissionStatus('denied');
            return 'denied';
        }
    }, [permissionStatus]);

    // Verificar el permiso cuando el hook se monta por primera vez.
    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    return { permissionStatus, checkPermission, requestPermission };
};
