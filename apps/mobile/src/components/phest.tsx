import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function Phest() {
    const [active, setActive] = useState(false);

    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => setActive(!active)}
                style={[
                    styles.button,
                    active && styles.activeButton,
                ]}
            >
                <Text style={styles.buttonText}>
                    {active ? 'Active' : 'Inactive'}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#64748b',
        padding: 14,
        borderRadius: 8,
    },
    activeButton: {
        backgroundColor: '#16a34a',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});