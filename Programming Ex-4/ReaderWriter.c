#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define NUM_READERS 5
#define NUM_WRITERS 2

sem_t mutex, wrt;
int read_count = 0;

void *reader(void *arg) {
    int reader_id = *((int*) arg);
    while (1) {
        sem_wait(&mutex);
        read_count++;
        if (read_count == 1) {
            sem_wait(&wrt);
        }
        sem_post(&mutex);

        // Reading...
        printf("Reader %d is reading...\n", reader_id);
        sleep(1); // Simulating reading

        sem_wait(&mutex);
        read_count--;
        if (read_count == 0) {
            sem_post(&wrt);
        }
        sem_post(&mutex);
    }
    return NULL;
}

void *writer(void *arg) {
    int writer_id = *((int*) arg);
    while (1) {
        sem_wait(&wrt);

        // Writing...
        printf("Writer %d is writing...\n", writer_id);
        sleep(1); // Simulating writing

        sem_post(&wrt);
    }
    return NULL;
}

int main() {
    pthread_t reader_threads[NUM_READERS], writer_threads[NUM_WRITERS];
    sem_init(&mutex, 0, 1);
    sem_init(&wrt, 0, 1);

    int reader_indices[NUM_READERS], writer_indices[NUM_WRITERS];

    // Creating reader threads
    for (int i = 0; i < NUM_READERS; i++) {
        reader_indices[i] = i + 1;
        pthread_create(&reader_threads[i], NULL, reader, &reader_indices[i]);
    }

    // Creating writer threads
    for (int i = 0; i < NUM_WRITERS; i++) {
        writer_indices[i] = i + 1;
        pthread_create(&writer_threads[i], NULL, writer, &writer_indices[i]);
    }

    // Waiting for reader threads to complete (never reached)
    for (int i = 0; i < NUM_READERS; i++) {
        pthread_join(reader_threads[i], NULL);
    }

    // Waiting for writer threads to complete (never reached)
    for (int i = 0; i < NUM_WRITERS; i++) {
        pthread_join(writer_threads[i], NULL);
    }

    // Destroying semaphores
    sem_destroy(&mutex);
    sem_destroy(&wrt);

    return 0;
}
