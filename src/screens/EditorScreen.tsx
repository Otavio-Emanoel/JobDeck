import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useResume } from '../contexts/ResumeProvider';
import type { Resume } from '../types/resume';
import { saveResume, getResume, updateResume } from '../services/storage';

type Props = { onDone?: () => void; onViewSaved?: () => void; editingId?: string; onBack?: () => void };

export default function EditorScreen({ onDone, onViewSaved, editingId, onBack }: Props) {
  const { setResume } = useResume();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [stateUF, setStateUF] = useState('');
  const [cep, setCep] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [positions, setPositions] = useState<Record<string, number>>({});

  // Parser robusto para o campo location salvo em string
  function parseLocation(loc?: string) {
    const out = { street: '', number: '', neighborhood: '', city: '', stateUF: '', cep: '' };
    if (!loc) return out;
    let rest = String(loc);

    // CEP
    const cepMatch = rest.match(/(\b\d{5}-?\d{3}\b)/);
    if (cepMatch) {
      out.cep = cepMatch[1];
      rest = rest.replace(cepMatch[1], '').replace(/\s+,\s+|,\s+|\s+,/g, ',');
    }

    // Cidade - UF (considera acentos e espaços)
    const cityUfMatch = rest.match(/([A-Za-zÀ-ÿ .'-]+?)\s*-\s*([A-Za-z]{2})/);
    if (cityUfMatch) {
      out.city = cityUfMatch[1].trim();
      out.stateUF = cityUfMatch[2].toUpperCase();
      rest = rest.replace(cityUfMatch[0], '').replace(/\s+,\s+|,\s+|\s+,/g, ',');
    }

    // Sobrou: rua, numero, bairro (em alguma ordem separada por vírgula)
    const parts = rest.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length) {
      // Detecta número puro como segunda parte
      if (parts.length >= 2 && /^\d{1,6}$/.test(parts[1])) {
        out.street = parts[0];
        out.number = parts[1];
        out.neighborhood = parts[2] || '';
      } else {
        // Tenta "Rua X 123"
        const m = parts[0].match(/^(.*?)(?:\s+(\d{1,6}))?$/);
        out.street = (m?.[1] || parts[0]).trim();
        if (m?.[2]) out.number = m[2];
        out.neighborhood = parts[1] || '';
      }
    }
    return out;
  }

  useEffect(() => {
    if (!editingId) return;
    getResume(editingId).then((item: any) => {
      if (!item) return;
      const r: Resume = item.resume;
      setAvatar(r.personal.avatarUri);
      setName(r.personal.fullName || '');
      const sum = r.personal.summary || '';
      const dobTxt = sum.includes('Nascimento:') ? sum.replace('Nascimento:', '').trim() : '';
      setDob(dobTxt);
      setLanguages((r.languages || []).join(', '));

      const parsed = parseLocation(r.personal.location);
      setStreet(parsed.street);
      setNumber(parsed.number);
      setNeighborhood(parsed.neighborhood);
      setCity(parsed.city);
      setStateUF(parsed.stateUF);
      setCep(parsed.cep);

      setEducation(r.education?.[0]?.institution || '');
      setExperience(r.experiences?.[0]?.company || '');
    });
  }, [editingId]);

  function onLayoutField(key: string) {
    return (e: any) => {
      const y = e?.nativeEvent?.layout?.y ?? 0;
      setPositions(p => ({ ...p, [key]: y }));
    };
  }

  function scrollTo(key: string) {
    const y = positions[key] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
  }

  function formatDate(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const y = digits.slice(4, 8);
    const parts = [] as string[];
    if (d) parts.push(d);
    if (m) parts.push(m);
    if (y) parts.push(y);
    return parts.join('/');
  }

  function formatCEP(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão', 'Conceda acesso às fotos para selecionar uma imagem.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled) setAvatar(res.assets[0]?.uri);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Informe o nome.');
      return;
    }
    const langs = languages.split(',').map(s => s.trim()).filter(Boolean);
    const locParts = [] as string[];
    if (street.trim()) locParts.push(street.trim() + (number.trim() ? `, ${number.trim()}` : ''));
    if (neighborhood.trim()) locParts.push(neighborhood.trim());
    if (city.trim() || stateUF.trim()) locParts.push(`${city.trim()}${stateUF.trim() ? ` - ${stateUF.trim()}` : ''}`);
    if (cep.trim()) locParts.push(cep.trim());
    const location = locParts.filter(Boolean).join(', ');
    const resume: Resume = {
      personal: {
        fullName: name.trim(),
        email: '',
        location: location || undefined,
        summary: dob.trim() ? `Nascimento: ${dob.trim()}` : undefined,
        avatarUri: avatar,
      },
      education: education.trim()
        ? [{ id: Date.now().toString(), institution: education.trim(), degree: '', startDate: '', endDate: '' }]
        : [],
      experiences: experience.trim()
        ? [{ id: (Date.now() + 1).toString(), company: experience.trim(), role: '', startDate: '', endDate: '', description: '' }]
        : [],
      skills: [],
      languages: langs.length ? langs : undefined,
      certifications: [],
    };
    setResume(resume);
    if (editingId) {
      await updateResume(editingId, resume);
    } else {
      await saveResume(resume);
    }
    setSuccessModal(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: 'height' })} keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" contentInsetAdjustmentBehavior="automatic">
          <TouchableOpacity style={styles.backTop} onPress={onBack}>
            <Text style={styles.backTopText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editingId ? 'Editar currículo' : 'Novo currículo'}</Text>

          <View style={styles.avatarWrapper} onLayout={onLayoutField('avatar')}>
            <TouchableOpacity style={styles.avatarButton} activeOpacity={0.9} onPress={pickImage}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarPlaceholder}>Adicionar foto</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.field} onLayout={onLayoutField('name')}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} onFocus={() => scrollTo('name')} placeholder="Seu nome completo" placeholderTextColor="#9CA3AF" returnKeyType="next" />
          </View>
          <View style={styles.field} onLayout={onLayoutField('dob')}>
            <Text style={styles.label}>Data de nascimento</Text>
            <TextInput style={styles.input} value={dob} onChangeText={v => setDob(formatDate(v))} onFocus={() => scrollTo('dob')} placeholder="dd/mm/aaaa" placeholderTextColor="#9CA3AF" keyboardType="number-pad" maxLength={10} returnKeyType="next" />
          </View>

          <Text style={styles.section}>Endereço</Text>
          <View style={styles.field} onLayout={onLayoutField('street')}>
            <Text style={styles.label}>Rua</Text>
            <TextInput style={styles.input} value={street} onChangeText={setStreet} onFocus={() => scrollTo('street')} placeholder="Rua/Avenida" placeholderTextColor="#9CA3AF" returnKeyType="next" />
          </View>
          <View style={styles.row}>
            <View style={[styles.field, styles.colSmall]} onLayout={onLayoutField('number')}>
              <Text style={styles.label}>Número</Text>
              <TextInput style={styles.input} value={number} onChangeText={v => setNumber(v.replace(/\D/g, '').slice(0, 6))} onFocus={() => scrollTo('number')} placeholder="Nº" placeholderTextColor="#9CA3AF" keyboardType="number-pad" returnKeyType="next" />
            </View>
            <View style={[styles.field, styles.colFlex]} onLayout={onLayoutField('neighborhood')}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} onFocus={() => scrollTo('neighborhood')} placeholder="Bairro" placeholderTextColor="#9CA3AF" returnKeyType="next" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.field, styles.colFlex]} onLayout={onLayoutField('city')}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} onFocus={() => scrollTo('city')} placeholder="Cidade" placeholderTextColor="#9CA3AF" returnKeyType="next" />
            </View>
            <View style={[styles.field, styles.colTiny]} onLayout={onLayoutField('stateUF')}>
              <Text style={styles.label}>UF</Text>
              <TextInput style={styles.input} value={stateUF} onChangeText={v => setStateUF(v.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))} onFocus={() => scrollTo('stateUF')} placeholder="UF" placeholderTextColor="#9CA3AF" autoCapitalize="characters" maxLength={2} returnKeyType="next" />
            </View>
            <View style={[styles.field, styles.colMedium]} onLayout={onLayoutField('cep')}>
              <Text style={styles.label}>CEP</Text>
              <TextInput style={styles.input} value={cep} onChangeText={v => setCep(formatCEP(v))} onFocus={() => scrollTo('cep')} placeholder="00000-000" placeholderTextColor="#9CA3AF" keyboardType="number-pad" maxLength={9} returnKeyType="next" />
            </View>
          </View>

          <Text style={styles.section}>Formação acadêmica</Text>
          <View style={styles.field} onLayout={onLayoutField('education')}>
            <TextInput style={[styles.input, styles.multiline]} value={education} onChangeText={setEducation} onFocus={() => scrollTo('education')} placeholder="Curso, instituição, período" placeholderTextColor="#9CA3AF" multiline />
          </View>

          <Text style={styles.section}>Experiência profissional</Text>
          <View style={styles.field} onLayout={onLayoutField('experience')}>
            <TextInput style={[styles.input, styles.multiline]} value={experience} onChangeText={setExperience} onFocus={() => scrollTo('experience')} placeholder="Empresa, cargo, atividades, período" placeholderTextColor="#9CA3AF" multiline />
          </View>

          <Text style={styles.section}>Proficiência linguística</Text>
          <View style={styles.field} onLayout={onLayoutField('languages')}>
            <TextInput style={styles.input} value={languages} onChangeText={setLanguages} onFocus={() => scrollTo('languages')} placeholder="Ex.: Português, Inglês" placeholderTextColor="#9CA3AF" />
          </View>

          <TouchableOpacity style={styles.saveButton} activeOpacity={0.9} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{editingId ? 'Salvar alterações' : 'Salvar'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={successModal} transparent animationType="fade" onRequestClose={() => setSuccessModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Alterações salvas' : 'Currículo salvo'}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalPrimary]} onPress={() => { setSuccessModal(false); onDone && onDone(); }}>
                <Text style={styles.modalPrimaryText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalSecondary]} onPress={() => { setSuccessModal(false); onViewSaved && onViewSaved(); }}>
                <Text style={styles.modalSecondaryText}>Ver salvos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 240,
  },
  backTop: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  backTopText: {
    color: '#111827',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  multiline: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  colSmall: {
    width: 92,
  },
  colTiny: {
    width: 72,
  },
  colMedium: {
    width: 140,
  },
  colFlex: {
    flex: 1,
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    color: '#6366F1',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalPrimary: {
    backgroundColor: '#2F80ED',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalSecondary: {
    backgroundColor: '#F3F4F6',
  },
  modalSecondaryText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
});
