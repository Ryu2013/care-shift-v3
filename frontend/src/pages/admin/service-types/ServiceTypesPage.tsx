import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from '../../../components/Header'
import { createServiceType, deleteServiceType, getAdminServiceTypes, updateServiceType } from '../../../api/service_types'
import type { ServiceType } from '../../../types'
import styles from './ServiceTypesPage.module.css'

export default function ServiceTypesPage() {
  const queryClient = useQueryClient()
  const [draftName, setDraftName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

  const { data: serviceTypes, isLoading } = useQuery({
    queryKey: ['service-types'],
    queryFn: () => getAdminServiceTypes().then((response) => response.data)
  })

  const createMutation = useMutation({
    mutationFn: createServiceType,
    onSuccess: async () => {
      setDraftName('')
      await queryClient.invalidateQueries({ queryKey: ['service-types'] })
      await queryClient.invalidateQueries({ queryKey: ['office-service-types'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateServiceType(id, name),
    onSuccess: async () => {
      setEditingId(null)
      setEditingName('')
      await queryClient.invalidateQueries({ queryKey: ['service-types'] })
      await queryClient.invalidateQueries({ queryKey: ['office-service-types'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteServiceType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['service-types'] })
      await queryClient.invalidateQueries({ queryKey: ['office-service-types'] })
    },
    onError: () => {
      alert('使用中のサービス種別は削除できません')
    }
  })

  function handleCreate() {
    if (draftName.trim() === '') {
      alert('サービス種別名を入力してください')
      return
    }

    createMutation.mutate(draftName.trim())
  }

  function startEdit(serviceType: ServiceType) {
    setEditingId(serviceType.id)
    setEditingName(serviceType.name)
  }

  function handleUpdate() {
    if (editingId === null || editingName.trim() === '') return

    updateMutation.mutate({ id: editingId, name: editingName.trim() })
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.content}>
        <div className={styles.hero}>
          <div>
            <h1>サービス種別</h1>
            <p>事業所ごとの訪問記録で使うサービス種別を管理します。</p>
          </div>
        </div>

        <section className={styles.createCard}>
          <h2>新規登録</h2>
          <div className={styles.createRow}>
            <input
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="例：身体介護"
            />
            <button type="button" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? '登録中...' : '登録'}
            </button>
          </div>
        </section>

        <section className={styles.listCard}>
          <h2>登録済み種別</h2>
          {isLoading ? (
            <p className={styles.emptyText}>読み込み中...</p>
          ) : serviceTypes?.length === 0 ? (
            <p className={styles.emptyText}>まだサービス種別が登録されていません。</p>
          ) : (
            <div className={styles.list}>
              {serviceTypes?.map((serviceType) => (
                <article key={serviceType.id} className={styles.item}>
                  {editingId === serviceType.id ? (
                    <div className={styles.editRow}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                      />
                      <button type="button" onClick={handleUpdate} disabled={updateMutation.isPending}>
                        保存
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => {
                          setEditingId(null)
                          setEditingName('')
                        }}
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3>{serviceType.name}</h3>
                        <p>ID: {serviceType.id}</p>
                      </div>
                      <div className={styles.itemActions}>
                        <button type="button" onClick={() => startEdit(serviceType)}>編集</button>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => deleteMutation.mutate(serviceType.id)}
                        >
                          削除
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
