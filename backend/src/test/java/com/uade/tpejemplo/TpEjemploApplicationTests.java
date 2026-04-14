package com.uade.tpejemplo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;

import com.uade.tpejemplo.repository.ClienteRepository;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class TpEjemploApplicationTests {

    @Autowired
    private ClienteRepository clienteRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void importSqlCargaClientesIniciales() {
        assertThat(clienteRepository.count()).isGreaterThanOrEqualTo(3);
        assertThat(clienteRepository.existsByDni("30111222")).isTrue();
    }
}
