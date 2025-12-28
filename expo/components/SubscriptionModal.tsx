import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiService } from '../services/api';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
  onSubscribe,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Create Stripe Checkout session
      const response = await apiService.createCheckoutSession();
      
      if (response.url) {
        // Redirect to Stripe Checkout
        if (typeof window !== 'undefined') {
          window.location.href = response.url;
        } else {
          Alert.alert(
            'Checkout Ready',
            'Opening Stripe Checkout...',
            [
              {
                text: 'OK',
                onPress: () => {
                  // For mobile, you would use Linking.openURL(response.url)
                  // or integrate with react-native-webview
                },
              },
            ]
          );
        }
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create checkout session');
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <Text style={styles.title}>Upgrade to Pro</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>$10</Text>
              <Text style={styles.pricePeriod}>per month</Text>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Pro Features:</Text>
              
              <View style={styles.feature}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Unlimited workout access</Text>
              </View>

              <View style={styles.feature}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Advanced progress tracking</Text>
              </View>

              <View style={styles.feature}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Personalized workout plans</Text>
              </View>

              <View style={styles.feature}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Ad-free experience</Text>
              </View>

              <View style={styles.feature}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Priority support</Text>
              </View>

              <View style={styles.feature}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Export workout data</Text>
              </View>

              <View style={styles.feature}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Custom rest timers</Text>
              </View>
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.paymentTitle}>Secure Payment</Text>
              <Text style={styles.paymentInfo}>
                Payment is processed securely through Stripe. You'll be redirected to complete your purchase.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
              onPress={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              One-time payment of $10 for 30 days of Pro access. Secure checkout powered by Stripe.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  scrollView: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    color: '#555',
  },
  paymentSection: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  paymentInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
});
